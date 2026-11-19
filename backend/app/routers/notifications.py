import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import Notification, User, utcnow
from ..schemas import MessageOut, NotificationOut

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def notification_out(n: Notification) -> NotificationOut:
    return NotificationOut(
        id=n.id, kind=n.kind, title=n.title, body=n.body, severity=n.severity, read=n.read_at is not None, created_at=n.created_at
    )


@router.get("", response_model=list[NotificationOut])
def list_notifications(limit: int = 20, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    limit = max(1, min(limit, 100))
    rows = db.scalars(
        select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()).limit(limit)
    ).all()
    return [notification_out(n) for n in rows]


@router.post("/read-all", response_model=MessageOut)
def mark_all_read(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MessageOut:
    db.execute(
        update(Notification).where(Notification.user_id == user.id, Notification.read_at.is_(None)).values(read_at=utcnow())
    )
    db.commit()
    return MessageOut(message="All notifications marked as read.")


@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_read(notification_id: uuid.UUID, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.scalar(select(Notification).where(Notification.id == notification_id, Notification.user_id == user.id))
    if not n:  # same response for "missing" and "belongs to someone else"
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Notification not found.")
    if n.read_at is None:
        n.read_at = utcnow()
        db.commit()
    return notification_out(n)
