---
inclusion: always
---

# Session Start Protocol

## First Actions Every Session

Execute these commands at the start of every session to understand current state:

```bash
# Check current context and what's in progress
cat memory-bank/activeContext.md

# Review recent activity and decisions
cat memory-bank/progress.md

# Check active issues and tracking
gh issue list --label agent-session --limit 10

# Review recent CI runs for failures
gh run list --limit 5
```

## Authentication

All GitHub CLI operations must use the workspace token:

```bash
GH_TOKEN="$GITHUB_JBCOM_TOKEN" gh <command>
```

## Public Repository Guidelines

This is a PUBLIC open-source repository. Leverage free tooling and avoid paid services.

### Use These (Free for Public Repos)

- **GitHub Actions** - Unlimited CI/CD minutes
- **CodeQL** - Automatic security scanning
- **Dependabot** - Automatic dependency updates
- **Copilot Code Review** - Automatic PR reviews
- **Community Contributors** - Human reviewers and collaborators

### Never Use These (Paid Services)

- ❌ Anthropic API calls (Claude Code Action)
- ❌ OpenAI API calls
- ❌ Any per-use paid AI services
- ❌ Paid third-party integrations

## Memory Bank System

The `memory-bank/` directory tracks session state and decisions:

- **activeContext.md** - Current work in progress, blockers, next steps
- **progress.md** - Historical log of completed work and decisions
- **session-summary.md** - Summary of recent sessions
- **final-summary.md** - Project-level summaries

Always update `activeContext.md` before ending a session with:
- What was accomplished
- What's blocked or needs attention
- Next steps for the following session

## PR Merge Requirements

Before merging any pull request, verify ALL requirements are met:

1. **CI Status**: All checks must pass (build, test, lint)
2. **Security**: CodeQL must pass with no HIGH or CRITICAL findings
3. **Review**: Copilot review feedback must be addressed
4. **Branch Protection**: Never bypass branch protection rules

### Dependabot PRs

- Minor and patch updates can auto-merge via workflow
- Major updates require manual review
- Never manually merge Dependabot PRs - let the workflow handle it

## Issue Tracking

Use GitHub Issues for all work tracking:

```bash
# Create tracking issue for new work
gh issue create --title "feat: description" --label agent-session

# Update existing issue with progress
gh issue comment <number> --body "Progress update..."

# Close issue when complete
gh issue close <number> --comment "Completed in PR #<number>"
```

## Workspace Structure

This is a monorepo with multiple packages:

- **Python packages**: `extended-data-types`, `lifecyclelogging`, `directed-inputs-class`, `python-terraform-bridge`, `vendor-connectors`
- **TypeScript packages**: `agentic-control`, `otterfall`
- **Go packages**: `vault-secret-sync`

Each package has its own build, test, and release configuration.
