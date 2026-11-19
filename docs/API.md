# API (Stage 1)

Interactive OpenAPI docs: `/api/docs` (disabled when `ENV=production`). JSON only. Errors: `{"detail": "...", "fields": {"field": "message"}}` (fields only on 422).

**Authentication:** HttpOnly `mc_session` cookie. **CSRF:** every non-GET request needs header `X-CSRF-Token` (obtain from `GET /api/auth/csrf`, or from the register/login response) and, if an `Origin` header is sent, it must be in `FRONTEND_ORIGINS`.

| Method & path | Auth | Purpose | Notes |
|---|---|---|---|
| GET `/api/health` | – | Liveness | |
| GET `/api/auth/csrf` | – | Issue CSRF token | |
| POST `/api/auth/register` | – | Create account, start session | 201. Rate-limited. Requires both consents and age ≥ 18. Duplicate email → generic 409 |
| POST `/api/auth/login` | – | Sign in | Uniform 401. Rate-limited. 5 failures → 15 min lock (429). `remember_me` → 30-day cookie |
| POST `/api/auth/logout` | ✔ | Revoke session | |
| GET `/api/auth/me` | ✔ | Current user | |
| POST `/api/auth/forgot-password` | – | Email reset link | Identical response for unknown emails. Rate-limited |
| POST `/api/auth/reset-password` | – | Set new password with token | Single-use, 30 min, revokes all sessions |
| GET/PATCH `/api/users/me` | ✔ | Read/update name and time zone | Email is not editable here |
| GET `/api/dashboard` | ✔ | Aggregated dashboard data | Computed from stored records; empty states for new accounts |
| GET `/api/notifications` | ✔ | List (limit 1–100) | |
| POST `/api/notifications/{id}/read`, `/read-all` | ✔ | Mark read | Other users' ids return 404 |

Password policy: 10–128 chars with lowercase, uppercase and a digit; not a common password; must not contain the email name or first name.
