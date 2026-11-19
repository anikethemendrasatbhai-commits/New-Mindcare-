"""Shared request dependencies: cookie sessions, CSRF enforcement and cookie helpers."""
from datetime import timedelta

from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from .config import get_settings
from .db import get_db
from .models import AuthSession, User, utcnow
from .security import csrf_valid, hash_token

SESSION_COOKIE = "mc_session"
CSRF_COOKIE = "mc_csrf_seed"
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def cookie_kwargs() -> dict:
    s = get_settings()
    return {"httponly": True, "secure": s.cookie_secure, "samesite": s.cookie_samesite, "domain": s.cookie_domain, "path": "/"}


def set_session_cookie(response: Response, token: str, remember: bool) -> None:
    s = get_settings()
    max_age = s.remember_me_days * 86400 if remember else None  # None => browser-session cookie
    response.set_cookie(SESSION_COOKIE, token, max_age=max_age, **cookie_kwargs())


def clear_session_cookies(response: Response) -> None:
    kw = cookie_kwargs()
    response.delete_cookie(SESSION_COOKIE, **kw)
    response.delete_cookie(CSRF_COOKIE, **kw)


def require_csrf(request: Request) -> None:
    """Applied app-wide. Unsafe methods need a valid per-browser CSRF token and, if sent, an allowed Origin."""
    if request.method in SAFE_METHODS:
        return
    s = get_settings()
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") not in s.origins:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Request origin is not allowed.")
    if not csrf_valid(request.cookies.get(CSRF_COOKIE), request.headers.get("x-csrf-token")):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Security check failed. Please refresh the page and try again.")


def get_current_session(request: Request, db: Session = Depends(get_db)) -> AuthSession:
    token = request.cookies.get(SESSION_COOKIE)
    unauthorized = HTTPException(status.HTTP_401_UNAUTHORIZED, "Please sign in to continue.")
    if not token:
        raise unauthorized
    now = utcnow()
    session = db.scalars(
        select(AuthSession)
        .options(joinedload(AuthSession.user).joinedload(User.profile))
        .where(AuthSession.token_hash == hash_token(token))
    ).first()
    if not session or session.revoked_at or session.expires_at <= now or not session.user.is_active:
        raise unauthorized
    if now - session.last_seen_at > timedelta(minutes=5):
        session.last_seen_at = now
        db.commit()
    return session


def get_current_user(session: AuthSession = Depends(get_current_session)) -> User:
    return session.user
