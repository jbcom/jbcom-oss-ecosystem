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

### CI Fix PRs Created

| Repo | PR | Issue Fixed |
|------|-----|-------------|
| extended-data-types | [#59](https://github.com/jbcom/extended-data-types/pull/59) | Absolute imports, lint fixes, agent files |
| lifecyclelogging | [#46](https://github.com/jbcom/lifecyclelogging/pull/46) | Absolute imports, lint fixes, agent files |
| directed-inputs-class | [#22](https://github.com/jbcom/directed-inputs-class/pull/22) | Absolute imports, lint fixes, agent files |
| python-terraform-bridge | [#2](https://github.com/jbcom/python-terraform-bridge/pull/2) | Dependency version fix, agent files |
| vendor-connectors | [#13](https://github.com/jbcom/vendor-connectors/pull/13) | Python 3.10+ requirement, agent files |
| vault-secret-sync | [#3](https://github.com/jbcom/vault-secret-sync/pull/3) | Go version 1.23, agent files |
| strata | [#1](https://github.com/jbcom/strata/pull/1) | TypeScript errors, Prettier, agent files |
| agentic-control | [#1](https://github.com/jbcom/agentic-control/pull/1) | Python ruff lint, Prettier, agent files |
| otterfall | [#5](https://github.com/jbcom/otterfall/pull/5) | Agent files only (CI already green) |

### Standardized Setup for Each Package

- ✅ CI workflow (.github/workflows/ci.yml) - build, test, lint, release
- ✅ memory-bank/activeContext.md - context for agents
- ✅ AGENTS.md - development guidance
- ✅ .cursor/rules/ - Cursor AI rules
- ✅ .kiro structure - steering + MCP settings
- ✅ Absolute imports throughout
- ✅ `from __future__ import annotations` in all Python files
- ✅ Prettier for TypeScript formatting
- ✅ Ruff for Python linting

### Special Notes

- **otterfall**: Previous code archived at `archive/pre-kiro-migration` branch
- **vendor-connectors**: Includes meshy submodule with webhooks, crewai, mcp, vector extras
- **agentic-control**: Dual npm + PyPI releases from single repo
- **strata**: Uses Prettier for formatting, core algorithms in pure TypeScript

### Monorepo Cleanup

All packages removed from `/workspace/packages/` and `/workspace/internal/crewai/`

---
*Updated: 2025-12-06*
