## Summary

Describe the user or engineering outcome.

## Scope

- [ ] Legacy V1 is unchanged, or the minimal fix is allowed by
      `docs/legacy-policy.md`.
- [ ] V2 modules remain independently organized.
- [ ] No draft Alembic migration was executed or promoted without review.
- [ ] No reviewed procurement-rule value changed unintentionally.

## Verification

- [ ] Backend Ruff lint and format check
- [ ] Backend mypy
- [ ] Backend pytest
- [ ] Frontend lint
- [ ] Frontend TypeScript check
- [ ] Frontend production build
- [ ] Relevant browser flow

## Security and data

- [ ] No `.env`, credential, token, database dump, log, PID file, or user data
      is included.
- [ ] New environment variables are documented in `.env.example`.
