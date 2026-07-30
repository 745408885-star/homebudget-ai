# Development guide

## Supported local toolchain

- Python 3.12
- Node.js 22
- npm 10+
- PostgreSQL
- Windows PowerShell for the included helper scripts

## Environment

Copy `.env.example` to `.env` and replace every `change-me` value locally.
Never commit `.env`.

The backend reads:

```text
DATABASE_URL
```

Docker Compose additionally reads:

```text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
```

## Database initialization

From `backend`:

```powershell
.\.venv\Scripts\python.exe -m alembic upgrade head
```

Only files under `alembic/versions` are executable migrations. Files under
`alembic/drafts` are design artifacts and must not be moved or executed without
product and migration review.

The current tests use an in-memory SQLite database and do not connect to the
developer PostgreSQL instance.

## Running locally

From the repository root:

```powershell
.\scripts\start-dev.ps1
```

The script derives the repository root from `$PSScriptRoot`, checks PostgreSQL,
`.env`, the Python virtual environment, Node modules, stale process state, and
ports before starting FastAPI and Vite.

Stop only the tracked project processes:

```powershell
.\scripts\stop-dev.ps1
```

PostgreSQL is never stopped by this script.

## Checks

Backend:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m ruff check app tests scripts
.\.venv\Scripts\python.exe -m ruff format --check app tests scripts
.\.venv\Scripts\python.exe -m mypy app
.\.venv\Scripts\python.exe -m pytest
```

Frontend:

```powershell
Set-Location frontend
npm run lint
npm run typecheck
npm run build
```

## Port conflicts

Defaults are 8000 for FastAPI and 5173 for Vite. The one-click script fails
safely if either port is in use and does not terminate the owning process.

## Rules for changes

- Preserve V1 behavior unless a task explicitly changes it.
- Keep V2 modules isolated by category.
- Shared components must not know category-specific business rules.
- Do not execute V2 draft migrations.
- Do not change reviewed procurement-rule values during structural refactors.
- Add tests for every contract or calculation change.
