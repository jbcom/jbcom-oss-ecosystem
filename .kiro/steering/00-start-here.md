---
inclusion: always
---

# jbcom OSS Ecosystem - Quick Reference

## Repository Context

This is a PUBLIC open-source monorepo containing multiple packages across Python, TypeScript, and Go. All work is tracked through GitHub Issues and automated via GitHub Actions.

## Essential First Commands

Before starting any work, check current state:

```bash
cat memory-bank/activeContext.md
gh issue list --label agent-session --limit 10
gh run list --limit 5
```

## Authentication

All GitHub CLI commands require the workspace token:

```bash
gh <command>
```

## Package Structure

| Package | Language | Registry | Scope |
|---------|----------|----------|-------|
| extended-data-types | Python | PyPI | `edt` |
| lifecyclelogging | Python | PyPI | `logging` |
| directed-inputs-class | Python | PyPI | `dic` |
| python-terraform-bridge | Python | PyPI | `bridge` |
| vendor-connectors | Python | PyPI | `connectors` |
| mesh-toolkit | Python | PyPI | `mesh` |
| agentic-control | TypeScript | npm | `agentic` |
| otterfall | TypeScript | (game) | `otterfall` |
| vault-secret-sync | Go | Docker | `vss` |

## Commit Convention

Use Conventional Commits for semantic versioning:

```
feat(scope): add new feature     → minor version bump
fix(scope): fix bug              → patch version bump
docs(scope): update docs         → no version bump
chore(scope): maintenance        → no version bump
```

Breaking changes: Add `!` after scope or `BREAKING CHANGE:` in footer.

## Workflow Guidelines

1. **Create tracking issue** for all work: `gh issue create --title "feat(scope): description" --label agent-session`
2. **Create feature branch** from main: `git checkout -b feat/scope-description`
3. **Make changes** with proper commit messages
4. **Run tests locally** before pushing (if applicable)
5. **Create PR** and wait for CI to pass
6. **Never bypass** branch protection or merge without passing CI
7. **Update memory bank** before ending session

## Memory Bank System

Track session state in `memory-bank/`:

- `activeContext.md` - Current work, blockers, next steps (update before ending session)
- `progress.md` - Historical log of completed work
- `session-summary.md` - Recent session summaries
- Package-specific files (e.g., `otterfall-progress.md`)

## Testing Requirements

- **Python**: Use pytest, maintain test coverage
- **TypeScript**: Use vitest for unit tests, Playwright for e2e
- **Go**: Use standard Go testing

Run tests before creating PRs. CI will fail if tests don't pass.

## Release Process

Releases are fully automated via semantic-release:

1. Merge PR to main with conventional commit
2. CI runs build + tests
3. semantic-release determines version from commits
4. Package published to registry
5. Git tag created automatically

**Never manually edit versions or create tags.**

## Public Repository Constraints

Free tooling only (no paid API calls):

- ✅ GitHub Actions (unlimited for public repos)
- ✅ CodeQL security scanning
- ✅ Dependabot updates
- ✅ Copilot code review
- ❌ Anthropic/OpenAI API calls
- ❌ Paid third-party services

## Additional Rules

Refer to other steering documents for detailed guidance:

- `00-session-start.md` - Session initialization protocol
- `01-branch-protection.md` - Branch protection requirements
- `05-ci-workflow.md` - CI/CD workflow details
- `10-problem-solving.md` - Debugging and problem-solving approach
