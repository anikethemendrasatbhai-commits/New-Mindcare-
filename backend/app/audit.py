import uuid

from fastapi import Request
from sqlalchemy.orm import Session

from .models import AuditLog
from .ratelimit import client_ip


def audit(db: Session, request: Request, action: str, user_id: uuid.UUID | None = None, **details) -> None:
    """Add an audit row to the current transaction (caller commits). Never put secrets or health data in details."""
    db.add(AuditLog(user_id=user_id, action=action, ip_address=client_ip(request), details=details or None))
