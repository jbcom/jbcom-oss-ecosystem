# Action Plan for jbcom-oss-ecosystem

## Current Status
- Branch: `clean/agent-rules` 
- Issue: Claude workflows failing on Dependabot PRs
- 7 Dependabot PRs stuck waiting for `claude-review` check
- Need to release `agentic-control` to npm

## Step-by-Step Actions

### Step 1: Fix Claude Workflow (CRITICAL - Blocks everything else)

**File:** `.github/workflows/claude-code-review.yml`

**Change needed:** Add condition to skip Dependabot PRs

**Lines 14-21:** Replace with:
```yaml
  claude-review:
    # Skip Dependabot PRs - they don't need Claude review
    if: github.event.pull_request.user.login != 'dependabot[bot]'
    runs-on: ubuntu-latest
```

**Why:** Dependabot PRs are dependency updates that don't need AI code review. The workflow is currently failing on them, blocking all merges.

### Step 2: Create PR for clean/agent-rules Branch

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

**Note:** Include the workflow fix from Step 1 in this PR.

### Step 3: Check Claude Workflow Failures

```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"

# List recent runs
gh run list --workflow=claude-code-review.yml --limit 10

# View logs for a specific failed run
gh run view <RUN_ID> --log
```

**Common issues to check:**
- Missing `ANTHROPIC_API_KEY` secret in repository settings
- Workflow syntax errors
- Permission issues

### Step 4: Merge clean/agent-rules PR

After CI passes:
```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"
gh pr merge <PR_NUMBER> --squash --delete-branch
```

### Step 5: Merge Dependabot PRs

After Step 1 is merged to main, Dependabot PRs should pass:

```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"

# List all Dependabot PRs
gh pr list --author "app/dependabot" --json number,title,state

# Merge each one
for pr in $(gh pr list --author "app/dependabot" --json number --jq '.[].number'); do
  echo "Merging PR #$pr"
  gh pr merge $pr --squash --delete-branch
done
```

**Dependabot PRs to merge:**
- #4: golang.org/x/crypto bump
- #6: vault sdk bump  
- #9: ai bump
- #10: vitest bump
- #11: vault bump
- #13: vault bump
- #18: dependabot grouping

### Step 6: Ensure agentic-control Release

The release happens automatically via CI when:
1. Changes are pushed to `main`
2. CI checks pass
3. Version bump detected from commits (feat/fix with `agentic` scope)

**To trigger release:**
1. Make a commit: `feat(agentic): trigger release` or `fix(agentic): trigger release`
2. Push to `main`
3. CI will detect changes and release

**Check release status:**
```bash
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"

# Check recent releases
gh release list --limit 10

# Check npm package
npm view agentic-control version
```

**Manual release (if needed):**
```bash
cd packages/agentic-control
pnpm version patch  # or minor/major
git push --tags
# CI will publish to npm automatically
```

## Quick Command Reference

```bash
# Set token
export GH_TOKEN="$GITHUB_JBCOM_TOKEN"

# Create PR
gh pr create --base main --head clean/agent-rules --title "..." --body "..."

# Check workflows
gh run list --workflow=claude-code-review.yml --limit 10
gh run view <ID> --log

# Merge PRs
gh pr merge <NUMBER> --squash --delete-branch

# List Dependabot PRs
gh pr list --author "app/dependabot"

# Check releases
gh release list
```

## Expected Outcome

After completing all steps:
1. ✅ Claude workflow fixed and working
2. ✅ clean/agent-rules merged to main
3. ✅ All 7 Dependabot PRs merged
4. ✅ agentic-control released to npm
5. ✅ Repository in stable state
