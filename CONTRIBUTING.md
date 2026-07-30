# Contributing

This repository is an Alpha technical preview. Please discuss product-scope
changes before implementation.

## Development workflow

1. Create a focused branch.
2. Follow `docs/legacy-policy.md`: Legacy V1 accepts only P0 security,
   startup-blocking, severe compatibility, or migration-essential fixes.
3. Keep V2 modules isolated by category.
4. Add or update tests for changed behavior.
5. Run all checks before opening a pull request.

### Backend

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m ruff check app tests scripts
.\.venv\Scripts\python.exe -m ruff format --check app tests scripts
.\.venv\Scripts\python.exe -m mypy app
.\.venv\Scripts\python.exe -m pytest
```

### Frontend

```powershell
Set-Location frontend
npm run lint
npm run typecheck
npm run build
```

Do not commit `.env`, local databases, logs, PID files, credentials, generated
build output, or personal IDE settings.

Unless explicitly stated otherwise, contributions submitted to this repository
are licensed under the same [Apache License 2.0](LICENSE) (`Apache-2.0`) terms
as the project.
