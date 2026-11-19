# MindCare Assess

Educational cognitive-wellbeing assessment platform (academic PBL project). **Assessment-derived insights only: not a medical device and not a diagnosis.**

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Recharts, React Router (Vite) |
| Backend | FastAPI, SQLAlchemy 2, Alembic |
| Database | PostgreSQL |
| Auth | Argon2id, server-side sessions in HttpOnly cookies, CSRF tokens, rate limiting, lockout |
| Hosting (planned) | Vercel (frontend), Render (API + managed PostgreSQL) |

## Status: Stage 1 of the staged plan
Done: design system, reusable components, registration, sign-in, sign-out, password reset, protected routes, dashboard backed by the real API/database, notifications, profile, consent records, audit log.

Not yet built (nav shows "Soon"): adaptive assessments, Cognitive Fingerprint, change detection, health timeline module, everyday observations, family circle, multimodal inputs. The dashboard shows honest empty states until assessment data exists.

## Repository layout
```
backend/    FastAPI app, Alembic migrations, tests
frontend/   React app, tests, contrast checker
docs/       Architecture, API, security, testing, licences, deployment
legacy/     Original student demo (static HTML/CSS/JS), preserved unchanged
render.yaml Render blueprint (API + Postgres)
```

## Quick start (development)
Requirements: Node 22+, Python 3.12+, PostgreSQL 15+.
```bash
# 1. Database
createdb mindcare_dev            # and a role/password of your choice

# 2. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env             # set DATABASE_URL and SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload    # http://localhost:8000/api/docs

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                      # http://localhost:5173  (proxies /api to :8000)
```
In development, password-reset emails are written to the API log instead of being sent.
Optional demo data: `python -m scripts.seed_dev_assessments you@example.com` inserts clearly synthetic results (refuses to run in production).

## Tests
```bash
cd backend && python -m pytest          # needs a mindcare_test database; see docs/TESTING.md
cd frontend && npm test && npm run typecheck && npm run build && npm run contrast
```

## Documentation
[Architecture (existing)](docs/ARCHITECTURE_EXISTING.md) · [Architecture (current)](docs/ARCHITECTURE.md) · [API](docs/API.md) · [Security](docs/SECURITY.md) · [Testing](docs/TESTING.md) · [Deployment](docs/DEPLOYMENT.md) · [Dependencies & licences](docs/THIRD_PARTY.md)

## Authorship and AI assistance
The original static demo (`legacy/`) and its educational content, disclaimers and the three activities were written by the project author and are preserved unchanged. The full-stack architecture, backend, frontend, tests and documentation added in Stage 1 were produced with AI assistance (Claude, by Anthropic) under the author's direction and requirements, and should be reviewed by the author before being presented as their own work. Git commits made with AI assistance carry a `Co-Authored-By` trailer.
