# Active Context

## Monorepo to Standalone Repos Migration - Complete (2025-12-06)

### Summary

Migrated all packages from monorepo to individual public repositories with standardized setups.

### Repos Created/Updated

| Package | Repo | Language | Registry |
|---------|------|----------|----------|
| extended-data-types | [jbcom/extended-data-types](https://github.com/jbcom/extended-data-types) | Python | PyPI |
| lifecyclelogging | [jbcom/lifecyclelogging](https://github.com/jbcom/lifecyclelogging) | Python | PyPI |
| directed-inputs-class | [jbcom/directed-inputs-class](https://github.com/jbcom/directed-inputs-class) | Python | PyPI |
| python-terraform-bridge | [jbcom/python-terraform-bridge](https://github.com/jbcom/python-terraform-bridge) | Python | PyPI |
| vendor-connectors | [jbcom/vendor-connectors](https://github.com/jbcom/vendor-connectors) | Python | PyPI |
| vault-secret-sync | [jbcom/vault-secret-sync](https://github.com/jbcom/vault-secret-sync) | Go | Docker |
| strata | [jbcom/strata](https://github.com/jbcom/strata) | TypeScript | npm |
| otterfall | [jbcom/otterfall](https://github.com/jbcom/otterfall) | TypeScript | GitHub |
| agentic-control | [jbcom/agentic-control](https://github.com/jbcom/agentic-control) | TS + Python | npm + PyPI |

### Key Mergers

1. **mesh-toolkit → vendor-connectors**: Meshy AI 3D generation now available via `vendor_connectors.meshy`
2. **crewai → agentic-control**: CrewAI engine now in `agentic-control/python/` as companion package

### Standardized Setup for Each Package

- ✅ CI workflow (.github/workflows/ci.yml) - build, test, lint, release
- ✅ .kiro structure - steering/00-development.md + settings/mcp.json
- ✅ Absolute imports throughout
- ✅ `from __future__ import annotations` in all Python files
- ✅ tox.ini for Python packages
- ✅ Proper .gitignore

### Special Notes

- **otterfall**: Previous code archived at `archive/pre-kiro-migration` branch
- **vendor-connectors**: Includes meshy submodule with webhooks, crewai, mcp, vector extras
- **agentic-control**: Dual npm + PyPI releases from single repo

### Monorepo Cleanup

All packages removed from `/workspace/packages/` and `/workspace/internal/crewai/`

---
*Updated: 2025-12-06*
