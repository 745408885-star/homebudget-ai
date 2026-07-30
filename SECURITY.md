# Security Policy

## Supported version

`v0.1.0-alpha.1` is an Alpha technical preview. It is not yet covered by a
production security-support commitment.

## Reporting a vulnerability

Do not disclose credentials, personal data, or exploitable details in a public
issue. Contact the repository owner privately and include:

- affected version;
- impact and reproducible steps;
- suggested mitigation, if known.

Never include a real `.env`, database dump, access token, private key, or user
record in a report.

## Current security boundary

- Local PostgreSQL is expected to bind only to localhost.
- Secrets are supplied through environment variables.
- V2 does not call external AI, product, or cloud-database services.
- Prototype prices must not be treated as financial or contractual quotations.
