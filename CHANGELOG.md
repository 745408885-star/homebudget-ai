# Changelog

All notable changes to this project will be documented here.

## [0.1.0-alpha.1] - 2026-07-30

### Added

- Legacy V1 explainable renovation-budget workflow.
- Independent V2 modular home-procurement planning prototype.
- PostgreSQL persistence, Alembic migrations, and local start/stop scripts.
- Modular V2 contracts and procurement-rule manifest.
- Project-level lint, formatting, type-checking, and CI configuration.
- Documentation index and Legacy V1 freeze policy.
- Apache License 2.0 (`Apache-2.0`) project licensing.

### Changed

- Marked V1 as frozen Legacy functionality.
- Split the V1 budget engine into scoring, allocation, reporting, and orchestration.
- Split V2 schemas and the 37-item draft procurement catalog by responsibility.
- Made V2 the default `/` product entry and moved frozen Legacy V1 to `/legacy`.
- Normalized `docs` Markdown names to lowercase kebab-case and updated links.
- Aligned the PostgreSQL 18 Compose volume target with the official image's
  version-specific `PGDATA` layout.
- Quoted the Vite entry argument so the Windows start script also works from
  repository paths containing spaces.

### Known limitations

- Budget Engine V2 is not connected.
- V2 prices are prototype estimates, not real quotations.
- The V2 database migration remains a non-executable draft.
