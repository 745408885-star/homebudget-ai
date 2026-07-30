# HomeBudget AI

> `v0.1.0-alpha.1` Alpha technical preview

HomeBudget AI is a home-procurement budget planner for mainland China. The
current product line is the modular V2 planner. The original renovation-budget
workflow is frozen as Legacy V1. `/` opens V2 by default; Legacy is available
only at `/legacy` for compatibility and result comparison.

This project is a planning aid, not a contractor quotation, product quotation,
or engineering-selection service. V2 prices are prototype or experimental
estimates. Budget Engine V2 and real product-price sources are not connected.

## Scope

V2 covers movable furniture, standalone appliances, soft furnishings, bedding,
move-in storage, and limited-installation smart devices. It excludes hard
finishes, construction, plumbing and electrical work, waterproofing, ceilings,
wall work, whole-home custom cabinetry, and renovation-dependent appliances.

Budget Engine V1 is frozen and will not receive new features, rules, fields,
UI redesigns, or algorithm improvements. Budget Engine V2 is not complete or
connected.

## Project structure

```text
frontend/src/pages/                       frozen Legacy V1 pages
frontend/src/features/v2Planner/          current V2 product line
backend/app/services/budget_engine.py     frozen Budget Engine V1 orchestration
backend/app/services/budget_engine_*.py   V1 scoring, allocation, reporting, types
backend/app/services/budget_engine_v2.py  unconnected V2 design interface
backend/app/schemas/v2/                   V2 data contracts
backend/data/procurement_rules/           modular V2 draft rules
```

## Quick start

Requirements: Python 3.12, Node.js 22, npm, and local PostgreSQL.

```powershell
Copy-Item .env.example .env

Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m alembic upgrade head
Set-Location ..

Set-Location frontend
npm ci
Set-Location ..

.\scripts\start-dev.ps1
```

Open:

- V2 default: http://127.0.0.1:5173/
- V2 basic information: http://127.0.0.1:5173/v2/planner/basic
- V2 module workbench: http://127.0.0.1:5173/v2/planner/modules
- V2 budget preview: http://127.0.0.1:5173/v2/planner/preview
- Legacy V1 (frozen): http://127.0.0.1:5173/legacy
- API docs: http://127.0.0.1:8000/docs

See [README.md](README.md) and the
[documentation index](docs/README.md) for complete setup, architecture, product
scope, testing, database, Legacy policy, and troubleshooting documentation.

## Status

- V1: frozen Legacy workflow.
- V2 UI: interactive Alpha prototype.
- V2 engine: not connected.
- V2 database migration: draft only.
- License: [Apache License 2.0](LICENSE) (`Apache-2.0`).

## Documentation

- [Documentation index](docs/README.md)
- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Product scope](docs/product-scope.md)
- [Known limitations](docs/known-limitations.md)
- [Legacy policy](docs/legacy-policy.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)

## License

HomeBudget AI is licensed under the
[Apache License 2.0](LICENSE) (`Apache-2.0`).
