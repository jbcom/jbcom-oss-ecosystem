# Workflow Fix Required

## Problem
The `claude-code-review.yml` workflow runs on ALL pull requests, including Dependabot PRs. This causes failures because:
1. Dependabot PRs don't need Claude code review
2. The workflow may be failing due to missing `ANTHROPIC_API_KEY` secret or other issues

## Solution
Add a condition to skip Dependabot PRs in `.github/workflows/claude-code-review.yml`:

**Current (line 14-21):**
```yaml
  claude-review:
    # Optional: Filter by PR author
    # if: |
    #   github.event.pull_request.user.login == 'external-contributor' ||
    #   github.event.pull_request.user.login == 'new-developer' ||
    #   github.event.pull_request.author_association == 'FIRST_TIME_CONTRIBUTOR'

    runs-on: ubuntu-latest
```

**Should be:**
```yaml
  claude-review:
    # Skip Dependabot PRs - they don't need Claude review
    if: github.event.pull_request.user.login != 'dependabot[bot]'
    runs-on: ubuntu-latest
```

## Manual Fix Steps

1. Edit `.github/workflows/claude-code-review.yml`
2. Replace lines 14-21 with the corrected version above
3. Commit and push the change
4. This will unblock all Dependabot PRs
