from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..audit import audit
from ..config import get_settings
from ..db import get_db
from ..deps import (
    CSRF_COOKIE,
    clear_session_cookies,
    cookie_kwargs,
    get_current_session,
    get_current_user,
    set_session_cookie,
)
from ..mailer import send_email
from ..models import (
    AuthSession,
    ConsentRecord,
    Notification,
    PasswordResetToken,
    User,
    UserProfile,
    utcnow,
)
from ..ratelimit import rate_limit
from ..schemas import (
    AuthOut,
    CsrfOut,
    ForgotPasswordIn,
    LoginIn,
    MessageOut,
    RegisterIn,
    ResetPasswordIn,
    UserOut,
)
from ..security import (
    csrf_token_for,
    hash_password,
    hash_token,
    needs_rehash,
    new_token,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.profile.full_name,
        timezone=user.profile.timezone,
        created_at=user.created_at,
    )


def _issue_csrf(response: Response, rotate: bool, request: Request) -> str:
    seed = None if rotate else request.cookies.get(CSRF_COOKIE)
    if not seed:
        seed = new_token()
        response.set_cookie(CSRF_COOKIE, seed, **cookie_kwargs())
    return csrf_token_for(seed)


def _start_session(db: Session, request: Request, response: Response, user: User, remember: bool) -> str:
    s = get_settings()
    token = new_token()
    lifetime = timedelta(days=s.remember_me_days) if remember else timedelta(hours=s.session_hours)
    db.add(
        AuthSession(
            user_id=user.id,
            token_hash=hash_token(token),
            expires_at=utcnow() + lifetime,
            user_agent=(request.headers.get("user-agent") or "")[:200] or None,
        )
    )
    set_session_cookie(response, token, remember)
    return _issue_csrf(response, rotate=True, request=request)  # fresh CSRF seed on every sign-in


@router.get("/csrf", response_model=CsrfOut)
def csrf(request: Request, response: Response) -> CsrfOut:
    response.headers["Cache-Control"] = "no-store"
    return CsrfOut(csrf_token=_issue_csrf(response, rotate=False, request=request))


@router.post(
    "/register",
    response_model=AuthOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit("register", "rate_limit_register_per_hour", 3600))],
)
def register(body: RegisterIn, request: Request, response: Response, db: Session = Depends(get_db)) -> AuthOut:
    s = get_settings()
    taken = HTTPException(
        status.HTTP_409_CONFLICT,
        "We couldn't create an account with these details. If you already have an account, try signing in.",
    )
    if db.scalar(select(User.id).where(User.email == body.email)):
        audit(db, request, "register_rejected_duplicate")
        db.commit()
        raise taken

    user = User(email=body.email, password_hash=hash_password(body.password))
    user.profile = UserProfile(full_name=body.full_name, date_of_birth=body.date_of_birth)
    db.add(user)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise taken from None

    for consent in ("privacy_notice", "not_diagnostic"):
        db.add(ConsentRecord(user_id=user.id, consent_type=consent, policy_version=s.policy_version, granted=True))
    db.add(
        Notification(
            user_id=user.id,
            kind="welcome",
            title="Welcome to MindCare Assess",
            body=(
                "Your account is ready. MindCare Assess provides educational, assessment-derived insights "
                "and is not a medical diagnosis."
            ),
        )
    )
    audit(db, request, "register_success", user.id)
    csrf_token = _start_session(db, request, response, user, remember=False)
    db.commit()
    return AuthOut(user=user_out(user), csrf_token=csrf_token)


@router.post(
    "/login",
    response_model=AuthOut,
    dependencies=[Depends(rate_limit("login", "rate_limit_login_per_minute", 60))],
)
def login(body: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)) -> AuthOut:
    s = get_settings()
    now = utcnow()
    user = db.scalar(select(User).where(User.email == body.email))

    if user and user.locked_until and user.locked_until > now:
        audit(db, request, "login_blocked_locked", user.id)
        db.commit()
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many sign-in attempts for this account. Please try again in a few minutes or reset your password.",
        )

    ok = verify_password(user.password_hash if user else None, body.password)
    if not (ok and user and user.is_active):
        if user:
            user.failed_login_count += 1
            if user.failed_login_count >= s.max_failed_logins:
                user.locked_until = now + timedelta(minutes=s.lockout_minutes)
                user.failed_login_count = 0
                audit(db, request, "account_locked", user.id)
            audit(db, request, "login_failure", user.id)
        else:
            audit(db, request, "login_failure_unknown_account")
        db.commit()
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "The email or password you entered is incorrect.")

    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = now
    if needs_rehash(user.password_hash):
        user.password_hash = hash_password(body.password)
    csrf_token = _start_session(db, request, response, user, body.remember_me)
    audit(db, request, "login_success", user.id)
    db.commit()
    return AuthOut(user=user_out(user), csrf_token=csrf_token)


@router.post("/logout", response_model=MessageOut)
def logout(
    request: Request,
    response: Response,
    session: AuthSession = Depends(get_current_session),
    db: Session = Depends(get_db),
) -> MessageOut:
    session.revoked_at = utcnow()
    audit(db, request, "logout", session.user_id)
    db.commit()
    clear_session_cookies(response)
    return MessageOut(message="You have been signed out.")


@router.get("/me", response_model=UserOut)
def me(response: Response, user: User = Depends(get_current_user)) -> UserOut:
    response.headers["Cache-Control"] = "no-store"
    return user_out(user)


@router.post(
    "/forgot-password",
    response_model=MessageOut,
    dependencies=[Depends(rate_limit("forgot", "rate_limit_forgot_per_hour", 3600))],
)
def forgot_password(body: ForgotPasswordIn, request: Request, db: Session = Depends(get_db)) -> MessageOut:
    s = get_settings()
    user = db.scalar(select(User).where(User.email == body.email, User.is_active.is_(True)))
    if user:
        now = utcnow()
        db.execute(
            update(PasswordResetToken)
            .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
            .values(used_at=now)
        )
        token = new_token()
        db.add(
            PasswordResetToken(
                user_id=user.id,
                token_hash=hash_token(token),
                expires_at=now + timedelta(minutes=s.reset_token_minutes),
            )
        )
        audit(db, request, "password_reset_requested", user.id)
        db.commit()
        link = f"{s.frontend_base_url.rstrip('/')}/reset-password?token={token}"
        send_email(
            user.email,
            "Reset your MindCare Assess password",
            f"Use this link to choose a new password (valid for {s.reset_token_minutes} minutes):\n\n{link}\n\n"
            "If you did not request this, you can ignore this email.",
        )
    else:
        audit(db, request, "password_reset_requested_unknown")
        db.commit()
    # Identical response whether or not the account exists.
    return MessageOut(message="If an account exists for that email, a password reset link is on its way.")


@router.post("/reset-password", response_model=MessageOut, dependencies=[Depends(rate_limit("reset", "rate_limit_login_per_minute", 60))])
def reset_password(body: ResetPasswordIn, request: Request, db: Session = Depends(get_db)) -> MessageOut:
    now = utcnow()
    record = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_token(body.token)))
    if not record or record.used_at or record.expires_at <= now:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired. Please request a new one.")
    user = db.get(User, record.user_id)
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "This reset link is invalid or has expired. Please request a new one.")

    user.password_hash = hash_password(body.password)
    user.failed_login_count = 0
    user.locked_until = None
    record.used_at = now
    # A password reset signs the account out everywhere.
    db.execute(
        update(AuthSession).where(AuthSession.user_id == user.id, AuthSession.revoked_at.is_(None)).values(revoked_at=now)
    )
    audit(db, request, "password_reset_completed", user.id)
    db.commit()
    return MessageOut(message="Your password has been updated. Please sign in.")
