# Active Context - jbcom OSS Ecosystem

## Current State

### Just Fixed (PR #34) - Go Dependency Upgrades
Fixed CI failures in Dependabot PR #34 (Go dependencies bump):
1. **Dockerfile**: Updated from `golang:1.24-alpine` to `golang:1.25-alpine` to match `go.mod` requirement of `go 1.25.3`
2. **Vault SDK API changes**: Updated code for breaking changes in Vault SDK v0.20.0:
   - `audit.ResponseEntry` → `audit.Event` with `Data *logical.LogInput`
   - Access pattern changed: `e.Event.Request.X` → `e.Event.Data.Request.X`
   - `Request.Namespace` field removed, now using `Request.ChrootNamespace`
3. Files modified:
   - `internal/event/event.go`
   - `internal/server/server.go`
   - `internal/sync/drivers.go`

CI now passes for all checks.

### Previously Fixed (PR #43)
- Dependabot auto-approve workflow
- Uses `hmarr/auto-approve-action` with GITHUB_TOKEN + proper permissions

### Pending
- PR #42: Dependabot update (@modelcontextprotocol/sdk 1.23.0 → 1.24.0)

### Open Issues
- #38 vault-secret-sync release pipeline
- #39 fleet agent spawning
- #40 agentic-control npm maintenance

### Latest Work (2025-12-03)
- Branch `fix/vss-build-artifacts` strips `packages/vault-secret-sync/Dockerfile` down to a two-stage Go builder with a BusyBox runtime (no tests inside the image).
- CI job `vault-secret-sync-build` now runs `go test ./...`, builds a multi-arch OCI layout via Buildx, and uploads it as an artifact; release job downloads that artifact and pushes using `docker buildx imagetools create`.
- Release workflow still computes semver bumps but no longer rebuilds Docker/Helm assets; the Docker tarball is reused and Helm packaging remains in-place.

---
*Updated: 2025-12-02*
