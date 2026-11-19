from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from ..models import AssessmentResult, AssessmentSession, Notification, User
from ..schemas import AssessmentSummaryOut, DashboardOut, TimelinePoint
from .auth import user_out
from .notifications import notification_out

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardOut)
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardOut:
    """All figures are computed from stored assessment records. A new account correctly shows empty states."""
    completed = db.scalar(
        select(func.count()).select_from(AssessmentSession).where(
            AssessmentSession.user_id == user.id, AssessmentSession.status == "completed"
        )
    ) or 0
    in_progress = db.scalar(
        select(func.count()).select_from(AssessmentSession).where(
            AssessmentSession.user_id == user.id, AssessmentSession.status == "in_progress"
        )
    ) or 0

    recent_rows = db.execute(
        select(AssessmentSession, AssessmentResult)
        .outerjoin(AssessmentResult, AssessmentResult.session_id == AssessmentSession.id)
        .where(AssessmentSession.user_id == user.id)
        .order_by(AssessmentSession.started_at.desc())
        .limit(5)
    ).all()
    recent = [
        AssessmentSummaryOut(
            id=s.id,
            status=s.status,
            difficulty_level=s.difficulty_level,
            started_at=s.started_at,
            completed_at=s.completed_at,
            overall_score=float(r.overall_score) if r else None,
            domain_scores={k: float(v) for k, v in r.domain_scores.items()} if r else None,
        )
        for s, r in recent_rows
    ]

    results = db.scalars(
        select(AssessmentResult)
        .where(AssessmentResult.user_id == user.id)
        .order_by(AssessmentResult.created_at.desc())
        .limit(12)
    ).all()
    results = list(reversed(results))  # oldest -> newest for charting
    timeline = [
        TimelinePoint(date=r.created_at, overall=float(r.overall_score), domains={k: float(v) for k, v in r.domain_scores.items()})
        for r in results
    ]

    unread = db.scalar(
        select(func.count()).select_from(Notification).where(Notification.user_id == user.id, Notification.read_at.is_(None))
    ) or 0
    notes = db.scalars(
        select(Notification).where(Notification.user_id == user.id).order_by(Notification.created_at.desc()).limit(5)
    ).all()

    return DashboardOut(
        user=user_out(user),
        assessments_completed=completed,
        assessments_in_progress=in_progress,
        last_assessment_at=results[-1].created_at if results else None,
        latest_domain_scores=timeline[-1].domains if timeline else None,
        recent_assessments=recent,
        timeline=timeline,
        unread_notifications=unread,
        notifications=[notification_out(n) for n in notes],
    )
