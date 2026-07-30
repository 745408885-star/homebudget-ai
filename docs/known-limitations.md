# Known limitations

Status: `v0.1.0-alpha.1`

## Product

- V2 is an interaction prototype.
- Legacy V1 and Budget Engine V1 are frozen and receive only security,
  startup-blocking, severe compatibility, or migration-essential fixes.
- Budget Engine V2 is not implemented or connected.
- Prototype amounts do not use live product prices.
- City product, delivery, installation, and service factors are not calibrated.
- No login, collaboration, version history, or product recommendation exists.

## Data

- The 37 V2 procurement rules are a draft catalog.
- The V2 Alembic migration is intentionally outside executable versions.
- V2 browser state is session-scoped and is not persisted to PostgreSQL.
- The product currently targets mainland China and CNY scenarios only.

## Engineering

- Browser end-to-end tests are manual; no committed automated browser suite yet.
- PostgreSQL integration is verified locally, while CI uses in-memory SQLite
  unit and API tests.
- Accessibility and performance have not received production certification.
- Dependency updates are not automated.

## Release

- The project is licensed under
  [Apache License 2.0](../LICENSE) (`Apache-2.0`).
- Alpha APIs and V2 data contracts may change before Beta.
