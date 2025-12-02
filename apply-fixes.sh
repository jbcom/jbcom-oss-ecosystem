#!/bin/bash
# Script to apply all fixes for jbcom-oss-ecosystem
# Usage: GH_TOKEN=$GITHUB_JBCOM_TOKEN ./apply-fixes.sh

set -e

REPO="jbcom/jbcom-oss-ecosystem"
BRANCH="clean/agent-rules"
BASE="main"

echo "=== Applying Fix 1: Update Claude Code Review Workflow ==="
WORKFLOW_FILE=".github/workflows/claude-code-review.yml"

# Create backup
cp "$WORKFLOW_FILE" "${WORKFLOW_FILE}.bak"

# Apply fix using sed
sed -i '/^  claude-review:/a\    # Skip Dependabot PRs - they do not need Claude review\n    if: github.event.pull_request.user.login != '\''dependabot[bot]'\''' "$WORKFLOW_FILE"

# Remove the old commented filter section
sed -i '/^    # Optional: Filter by PR author/,/^    #   github.event.pull_request.author_association == '\''FIRST_TIME_CONTRIBUTOR'\''/d' "$WORKFLOW_FILE"

echo "✓ Updated workflow file"
echo ""
echo "=== Fix 2: Create PR for $BRANCH -> $BASE ==="

# Check if PR already exists
EXISTING_PR=$(gh pr list --base "$BASE" --head "$BRANCH" --json number --jq '.[0].number' 2>/dev/null || echo "")

if [ -z "$EXISTING_PR" ]; then
  echo "Creating PR..."
  PR_NUMBER=$(gh pr create \
    --base "$BASE" \
    --head "$BRANCH" \
    --title "chore: clean up agent rules and memory bank" \
    --body "This PR cleans up conflicting agent instructions and establishes a single source of truth in .cursor/rules/

- Removed overlapping .ruler/*.md files
- Created clean .cursor/rules/00-start-here.mdc
- Created clean memory-bank/ structure
- Fixes Claude workflow to skip Dependabot PRs" \
    --json number --jq '.number')
  echo "✓ Created PR #$PR_NUMBER"
else
  PR_NUMBER="$EXISTING_PR"
  echo "✓ PR #$PR_NUMBER already exists"
fi

echo ""
echo "=== Fix 3: Check Claude Workflow Failures ==="
echo "Recent workflow runs:"
gh run list --workflow=claude-code-review.yml --limit 5 || echo "No runs found"

echo ""
echo "=== Fix 4: List Dependabot PRs ==="
DEPENDABOT_PRS=$(gh pr list --author "app/dependabot" --json number,title,state --jq '.[] | "\(.number): \(.title) (\(.state))"' || echo "No Dependabot PRs found")
echo "$DEPENDABOT_PRS"

echo ""
echo "=== Fix 5: Check agentic-control Release Status ==="
echo "Recent releases:"
gh release list --limit 5 || echo "No releases found"

echo ""
echo "=== Summary ==="
echo "1. ✓ Updated workflow to skip Dependabot PRs"
echo "2. ✓ Created/verified PR #$PR_NUMBER"
echo ""
echo "Next steps:"
echo "1. Review and merge PR #$PR_NUMBER"
echo "2. After merge, Dependabot PRs should pass - merge them with:"
echo "   gh pr merge <PR_NUMBER> --squash --delete-branch"
echo "3. Check agentic-control release after main branch updates"
