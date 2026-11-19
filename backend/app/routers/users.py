from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from ..audit import audit
from ..db import get_db
from ..deps import get_current_user
from ..models import User
from ..schemas import ProfileUpdateIn, UserOut
from .auth import user_out

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def get_me(user: User = Depends(get_current_user)) -> UserOut:
    return user_out(user)


@router.patch("/me", response_model=UserOut)
def update_me(
    body: ProfileUpdateIn, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> UserOut:
    changed = []
    if body.full_name is not None and body.full_name != user.profile.full_name:
        user.profile.full_name = body.full_name
        changed.append("full_name")
    if body.timezone is not None and body.timezone != user.profile.timezone:
        user.profile.timezone = body.timezone
        changed.append("timezone")
    if changed:
        audit(db, request, "profile_updated", user.id, fields=changed)
        db.commit()
    return user_out(user)
