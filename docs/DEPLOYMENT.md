# Deployment (prepared, not yet published)

1. **GitHub:** push the branch, open a PR, merge to `main`.
2. **Render:** New → Blueprint → select the repo (`render.yaml`). Set `FRONTEND_ORIGINS` and `FRONTEND_BASE_URL` to the Vercel URL. Render supplies `DATABASE_URL` as `postgresql://…`; change the scheme prefix to `postgresql+psycopg://` in the service's environment. Add SMTP settings (otherwise password-reset emails cannot be sent in production). Migrations run on each deploy (`alembic upgrade head`).
3. **Vercel:** import the repo, root directory `frontend`. In `frontend/vercel.json` replace `YOUR-RENDER-SERVICE` with the Render hostname. Leave `VITE_API_URL` empty so requests stay same-origin through the rewrite.
4. Verify: `https://<app>/api/health`, register, sign in, reload, sign out.
5. Free Render tiers sleep and free Postgres expires: use paid tiers before any real use.
Generate `SECRET_KEY` with `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
