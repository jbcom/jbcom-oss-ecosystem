# Active Context - jbcom OSS Ecosystem

## Current State

### jbcom-oss-ecosystem (this repo)
- agentic-control build: PASSING
- CI: running
- Docs: cleaned (removed control-center cruft)

### External PRs

| Repo | PR | Status | Notes |
|------|-----|--------|-------|
| fsc-platform/cluster-ops | #156 | Ready for human review | vault-secret-sync deployment |
| fsc-platform/cluster-ops | #157 | Ready for human review | agentic configuration |
| FlipsideCrypto/terraform-modules | #226 | MERGED | cleanup plan + agentic config |

### Entrypoints by Org

| Org | Entrypoint | Token |
|-----|------------|-------|
| jbcom | jbcom-oss-ecosystem | GITHUB_JBCOM_TOKEN |
| fsc-platform | cluster-ops | GITHUB_FSC_TOKEN |
| FlipsideCrypto | terraform-modules | GITHUB_FSC_TOKEN |

### Open Issues
- #38 vault-secret-sync release pipeline
- #39 fleet agent spawning
- #40 agentic-control npm maintenance

### Recent Work
- Fixed race condition in `Agent.initialize()` and `PRTriageAgent.initialize()` methods
  - Issue: Concurrent calls could both pass the `if (this.initialized)` check and call `initializeMCPClients()` twice
  - Fix: Implemented Promise-based lock pattern using `initializationPromise` field
  - Files: `packages/agentic-control/src/triage/agent.ts`, `packages/agentic-control/src/triage/pr-triage-agent.ts`

---
*Updated: 2025-12-02*
