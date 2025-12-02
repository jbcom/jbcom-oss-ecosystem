# Contributing to jbcom OSS Ecosystem

Thank you for your interest in contributing! This document explains our contribution workflow.

## The Fork-and-Branch Model

We use a **fork-and-branch** workflow for all contributions:

1. **Fork** this repository to your account
2. **Keep your fork's `main` in sync** with upstream
3. **Create feature branches** for your changes (never commit directly to main)
4. **Submit PRs** from your feature branch to our main
5. **Address feedback** from Copilot and reviewers
6. Once merged, **sync your fork** and delete the feature branch

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/jbcom-oss-ecosystem.git
cd jbcom-oss-ecosystem

# Add upstream remote
git remote add upstream https://github.com/jbcom/jbcom-oss-ecosystem.git

# Keep main in sync
git fetch upstream
git checkout main
git merge upstream/main
```

## Making Changes

```bash
# Create feature branch from up-to-date main
git checkout main
git pull upstream main
git checkout -b feature/your-change

# Make your changes...

# Commit with conventional commit messages
git commit -m "feat(package): add new feature"
git commit -m "fix(package): fix bug"

# Push to your fork
git push origin feature/your-change

# Create PR via GitHub UI
```

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(edt): add new utility function
fix(connectors): handle null response
docs(bridge): update README
test(logging): add integration tests
```

**Scopes:**
- `edt` - extended-data-types
- `logging` - lifecyclelogging
- `dic` - directed-inputs-class
- `bridge` - python-terraform-bridge
- `connectors` - vendor-connectors
- `agentic` - agentic-control
- `vss` - vault-secret-sync

## PR Requirements

Before your PR can be merged:

1. **CI must pass** - tests, build, lint
2. **CodeQL must pass** - no HIGH/CRITICAL security issues
3. **Copilot feedback** - address any review comments
4. **One focused change** - keep PRs small and reviewable

## For AI Agents

If you're an AI agent contributing:

1. Read `.cursor/rules/` for operational instructions
2. Check `memory-bank/` for session context
3. Use GitHub Issues for tracking
4. Follow the same PR workflow as humans

## Upstream Contributions (vault-secret-sync)

For contributing to upstream projects like vault-secret-sync:

1. All development happens in `packages/vault-secret-sync/`
2. Upstream-worthy changes are synced to our fork ([jbcom/vault-secret-sync](https://github.com/jbcom/vault-secret-sync))
3. From the fork, we create PRs to [robertlestak/vault-secret-sync](https://github.com/robertlestak/vault-secret-sync)

See our [Upstream Contribution Guide](docs/UPSTREAM-CONTRIBUTIONS.md) for details.

## Questions?

Open an issue or check existing issues for answers.

---
*This contribution guide applies to both human and AI contributors.*
