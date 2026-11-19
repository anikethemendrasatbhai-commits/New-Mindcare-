"""Small in-memory sliding-window rate limiter.

Adequate for a single instance. If the API is scaled horizontally, back this with a shared store (e.g. Redis).
Behind a proxy (Render), run uvicorn with --proxy-headers so request.client.host is the real client address.
"""
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from .config import get_settings

_lock = threading.Lock()
_hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def reset_rate_limits() -> None:
    with _lock:
        _hits.clear()


def client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def rate_limit(scope: str, limit_attr: str, window_seconds: int):
    """FastAPI dependency factory. `limit_attr` names an integer Settings field so limits are configurable."""

    def dependency(request: Request) -> None:
        settings = get_settings()
        if not settings.rate_limit_enabled:
            return
        limit = getattr(settings, limit_attr)
        key = (scope, client_ip(request))
        now = time.monotonic()
        with _lock:
            q = _hits[key]
            while q and now - q[0] > window_seconds:
                q.popleft()
            if len(q) >= limit:
                retry = max(1, int(window_seconds - (now - q[0])))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many attempts. Please wait a little before trying again.",
                    headers={"Retry-After": str(retry)},
                )
            q.append(now)

    return dependency
