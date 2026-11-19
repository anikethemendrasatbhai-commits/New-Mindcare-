# Testing

Results recorded at the end of Stage 1 (re-run after a session pause).

| Suite | Command | Result |
|---|---|---|
| Backend (pytest, real PostgreSQL, schema built from the Alembic migration) | `cd backend && python -m pytest` | 40 passed |
| Frontend unit/component (Vitest, Testing Library) | `cd frontend && npm test` | 16 passed (3 files) |
| TypeScript | `npm run typecheck` | clean |
| Production build | `npm run build` | succeeds |
| WCAG contrast of palette pairs | `npm run contrast` | all listed *used* pairs pass; the exact-brand pairs that fail are documented and not used for text |
| Dependency audit (npm, production deps) | `npm audit --omit=dev` | 0 vulnerabilities |
| Browser end-to-end (Chrome via Playwright, live API + DB) | manual script, not committed | 15/15 checks passed on the final run (see below) |

Backend tests cover registration validation, duplicate handling, hashing, session storage/cookie flags, login/logout/persistence, remember-me, lockout, rate limiting, expired/inactive sessions, SQL-injection strings, CSRF/Origin, password reset (single-use, expiry, revocation), dashboard aggregation, cross-user isolation, notifications and profile updates. A mutation check (disabling CSRF and lockout) made the expected 4 tests fail.

End-to-end checks: anonymous redirect, form validation, real-API error display, UI registration, cookie flags, persistence on reload, charts rendered from DB data, interactive toggles, notification read, profile edit, 390 px layout without horizontal overflow, logout, remember-me cookie, no unexpected console errors. The e2e script is not yet in the repo (planned: Playwright suite in Stage 2).

**Not yet tested:** screen-reader behaviour (only automated/keyboard-oriented design so far), Safari/Firefox, tablet widths, load/performance, email delivery over real SMTP, deployment on Vercel/Render.
Backend test DB: `createdb mindcare_test` (the suite drops and rebuilds the `public` schema there; override with `TEST_DATABASE_URL`).
