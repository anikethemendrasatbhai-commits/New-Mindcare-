# Third-party dependencies

Versions are pinned by `backend/requirements*.txt` and `frontend/package-lock.json`. Licences below are as published by each project; confirm with a licence scanner (e.g. `pip-licenses`, `license-checker`) before distribution.

**Backend (Python):** FastAPI (MIT), Starlette (BSD-3), Uvicorn (BSD-3), SQLAlchemy (MIT), Alembic (MIT), psycopg (LGPL-3.0, dynamically linked), argon2-cffi (MIT), Pydantic and pydantic-settings (MIT), email-validator (CC0), python-dotenv (BSD-3); dev: pytest (MIT), httpx (BSD-3).
**Frontend:** React and React DOM (MIT), React Router (MIT), Recharts (MIT), lucide-react (ISC), Tailwind CSS (MIT), Vite (MIT), TypeScript (Apache-2.0), Vitest (MIT), Testing Library (MIT), jsdom (MIT), oxlint (MIT).
**Font:** Inter via `@fontsource-variable/inter` (SIL Open Font License 1.1), self-hosted, so no requests go to third-party font servers.
**Services (planned):** Vercel, Render, managed PostgreSQL.
