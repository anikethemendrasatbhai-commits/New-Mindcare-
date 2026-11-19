# Security and privacy (Stage 1)

## Implemented and tested
- **Passwords:** Argon2id; transparent re-hash on login if parameters change; policy enforced server-side. Verification does equal work for unknown accounts, and login/reset responses are uniform, to limit account enumeration.
- **Sessions:** random 256-bit token in an HttpOnly, SameSite=Lax cookie (`Secure` in production); only its SHA-256 is stored. Logout revokes server-side. Password reset revokes all sessions. Sessions expire (12 h, or 30 days with "remember me").
- **CSRF:** HMAC token bound to a per-browser seed cookie, enforced app-wide on non-GET requests, plus Origin allow-list. Seed rotates at sign-in.
- **Abuse controls:** per-IP rate limits (login, register, forgot, reset); per-account lockout.
- **Input validation:** Pydantic models with `extra=forbid`; names reject markup/control characters; validation errors never echo submitted values. SQL access is through the SQLAlchemy ORM (parameterised).
- **XSS:** React escapes output; no `dangerouslySetInnerHTML`; strict CSP configured for the Vercel frontend and the API.
- **Authorization:** every data endpoint derives the user from the session and filters by `user_id`; cross-user access returns the same 404 as a missing record.
- **Audit log:** sign-in, failures, lockouts, resets, profile changes (no secrets or health data in details).
- **Consent:** privacy notice and non-diagnostic acknowledgement stored per user with policy version and timestamp.
- **Secrets:** environment variables only; `.env` is git-ignored; production refuses to start without `COOKIE_SECURE=true`.
- **Data minimisation:** name, email, date of birth only.

## Known limitations / required before real-world use
1. Rate limiter is in-memory (per instance); use a shared store if scaled out.
2. No email verification, MFA, account export/deletion, or session-management UI yet.
3. `audit_logs` stores IP addresses; define a retention period.
4. Date of birth and (later) assessment data are personal health-adjacent data: real deployment requires a legal review (e.g. India DPDP Act, GDPR), encryption-at-rest configuration with the DB provider, backups and a breach process.
5. Audio, family sharing and behaviour data (later stages) need their own explicit, revocable consents; the `consent_records` table already supports `audio_collection` and `family_sharing`.
6. Dependency scanning (`npm audit` reported 0 vulnerabilities on the date of this stage; `pip-audit` has not been run).
