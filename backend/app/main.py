import logging

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .deps import require_csrf
from .routers import auth, dashboard, notifications, users

settings = get_settings()
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="MindCare Assess API",
    version="0.1.0",
    description=(
        "Educational cognitive-assessment platform API. Outputs are assessment-derived and are not medical diagnoses."
    ),
    docs_url=None if settings.env == "production" else "/api/docs",
    redoc_url=None,
    openapi_url=None if settings.env == "production" else "/api/openapi.json",
    dependencies=[Depends(require_csrf)],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
    max_age=600,
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    if not request.url.path.startswith("/api/docs") and request.url.path != "/api/openapi.json":
        response.headers.setdefault("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'")
    if settings.cookie_secure:
        response.headers.setdefault("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    if request.url.path.startswith("/api/") and request.method == "GET":
        response.headers.setdefault("Cache-Control", "no-store")
    return response


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Return friendly, field-addressable messages without echoing submitted values (e.g. passwords)."""
    fields: dict[str, str] = {}
    for err in exc.errors():
        loc = [str(p) for p in err["loc"] if p not in ("body", "query", "path")]
        key = loc[-1] if loc else "form"
        msg = err["msg"].removeprefix("Value error, ")
        fields.setdefault(key, msg)
    return JSONResponse(status_code=422, content={"detail": "Please check the highlighted fields.", "fields": fields})


@app.get("/api/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
