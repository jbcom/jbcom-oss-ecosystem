# Required Fixes for jbcom-oss-ecosystem

## Issue Summary
1. Claude workflows are failing on Dependabot PRs
2. Need to create PR for clean/agent-rules branch
3. Need to merge Dependabot PRs
4. Need to ensure agentic-control gets released

## Fix 1: Update Claude Code Review Workflow

Edit `.github/workflows/claude-code-review.yml`:

**Change line 14-19 from:**
```yaml
  claude-review:
    # Optional: Filter by PR author
    # if: |
    #   github.event.pull_request.user.login == 'external-contributor' ||
    #   github.event.pull_request.user.login == 'new-developer' ||
    #   github.event.pull_request.author_association == 'FIRST_TIME_CONTRIBUTOR'

    runs-on: ubuntu-latest
```

**To:**
```yaml
  claude-review:
    # Skip Dependabot PRs - they don't need Claude review
    if: github.event.pull_request.user.login != 'dependabot[bot]'
    runs-on: ubuntu-latest
```

## Fix 2: Create PR for clean/agent-rules

Run:
```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"
gh pr create \
  --base main \
  --head clean/agent-rules \
  --title "chore: clean up agent rules and memory bank" \
  --body "This PR cleans up conflicting agent instructions and establishes a single source of truth in .cursor/rules/

- Removed overlapping .ruler/*.md files
- Created clean .cursor/rules/00-start-here.mdc
- Created clean memory-bank/ structure
- Fixes Claude workflow to skip Dependabot PRs"
```

## Fix 3: Check and Fix Claude Workflow Failures

1. List recent workflow runs:
```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"
gh run list --workflow=claude-code-review.yml --limit 10
```

2. View logs for failed runs:
```bash
gh run view <run-id> --log
```

3. Common issues:
   - Missing `ANTHROPIC_API_KEY` secret - needs to be set in repository settings
   - Workflow running on Dependabot PRs - fixed by Fix 1 above

## Fix 4: Merge Dependabot PRs

After Fix 1 is merged, Dependabot PRs should pass. Then merge them:

```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"

# List Dependabot PRs
gh pr list --author "app/dependabot"

# Merge each one
gh pr merge <PR_NUMBER> --squash --delete-branch
```

## Fix 5: Ensure agentic-control Release

The release happens automatically via CI workflow when:
1. Changes are pushed to main
2. CI checks pass
3. Version bump is detected from commits

To trigger manually if needed:
1. Make a commit with `feat(agentic):` or `fix(agentic):` scope
2. Push to main
3. CI will detect and release

Check release status:
```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"
gh release list --limit 10
```
