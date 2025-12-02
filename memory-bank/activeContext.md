# Active Context - jbcom OSS Ecosystem

## Status: Migration from jbcom-control-center COMPLETE

### External PRs (Awaiting Human Review)
- **fsc-platform/cluster-ops#156** - vault-secret-sync deployment
- **fsc-platform/cluster-ops#157** - agentic configuration
- **FlipsideCrypto/terraform-modules#226** - MERGED

### This Repo
- agentic.config.json configured for jbcom org
- CI passing, packages releasing
- Docs cleaned (removed control-center specific files)

### Entrypoints by Org
| Org | Repo | Token |
|-----|------|-------|
| jbcom | jbcom-oss-ecosystem | GITHUB_JBCOM_TOKEN |
| fsc-platform | cluster-ops | GITHUB_FSC_TOKEN |
| FlipsideCrypto | terraform-modules | GITHUB_FSC_TOKEN |

### Open Issues
- #38 vault-secret-sync release pipeline
- #39 fleet agent spawning
- #40 agentic-control npm maintenance
- #36 cursor session recovery (manual)

---
*Updated: 2025-12-02*
