# Changelog

## [Unreleased]

### Changed
- Structural Express-compatible types without runtime dependencies.
- Safer HSTS defaults on secure requests only; no automatic preload or includeSubDomains.
- Legacy X-XSS-Protection defaults to 0.
- New options for Permissions Policy, COOP and CORP.
- Validate policy values against header splitting.

### Added
- npm package manifest and TypeScript build configuration.
- Cross-platform Node.js test matrix, unit tests and Dependabot.

## [0.1.0] - 2025-06-30
- Initial middleware prototype (unpackaged).
