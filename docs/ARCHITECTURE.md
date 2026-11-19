# Architecture (Stage 1)

```
Browser (React SPA) ──/api (same origin)──▶ FastAPI ──SQLAlchemy──▶ PostgreSQL
   Vercel rewrite or Vite proxy               Render
```

## Why same-origin `/api`
The browser only ever talks to its own origin; Vercel (production) or Vite (development) forwards `/api` to the backend. Cookies therefore stay `SameSite=Lax`, which is the strongest practical CSRF posture, and no cross-site cookie workarounds are needed. CORS is still configured with an explicit origin allow-list.

## Backend modules (`backend/app`)
| Module | Responsibility |
|---|---|
| `config.py` | Typed settings from environment; production guards |
| `models.py` | Tables, constraints, indexes (see schema below) |
| `security.py` | Argon2id hashing, token hashing, CSRF tokens, password policy |
| `deps.py` | Cookie sessions, CSRF/origin enforcement (applied app-wide) |
| `ratelimit.py`, `audit.py`, `mailer.py` | Rate limits, audit trail, email |
| `routers/` | `auth`, `users`, `dashboard`, `notifications` (thin HTTP layer) |
| `schemas.py` | Pydantic request/response validation (`extra=forbid`) |

Later stages add a separate `analysis/` package (scoring, trends, fingerprint) with no HTTP or UI code, and per-modality processors.

## Frontend structure (`frontend/src`)
`lib/` (API client, validation, formatting, domain constants) · `auth/` (session context, route guards, shared dashboard data) · `components/ui/` (design-system primitives) · `components/layout/` · `components/dashboard/` · `pages/`.

## Database schema (Stage 1: 9 tables)
`users`, `user_profiles` (1:1), `auth_sessions` (hashed token), `password_reset_tokens` (hashed), `consent_records` (append-only, versioned), `notifications`, `audit_logs`, `assessment_sessions`, `assessment_results` (domain scores as JSONB, `scoring_version` recorded). All foreign keys cascade or set-null deliberately; CHECK constraints enforce roles, severities, score ranges and lowercase emails; indexes cover the dashboard queries.
Still to add via migrations: assessment questions/responses, fingerprints, timeline records, behaviour observations, family relationships, permissions.

## Design system
Tokens live in `frontend/src/index.css`. Exact brand colours are used for fills, icons and charts. The exact primary `#438F91` is 3.77:1 on white, below WCAG AA for text, so text and button labels use a derived darker teal (`primary-strong #2F6B6D`, 6.1:1). `npm run contrast` verifies every pairing. The exact warning amber `#F5C66A` is used as a fill with dark text (7.95:1), never as a thin line on white (1.59:1).
