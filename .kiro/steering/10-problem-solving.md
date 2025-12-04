---
inclusion: always
---

# Problem Solving Protocol

## Systematic Failure Response

When encountering failures, follow this structured approach:

### 1. Diagnose Before Acting

**Read error messages completely.** Do not guess or make assumptions.

```bash
# Get full error context from CI
gh run view <run-id> --log-failed

# Search for similar issues
gh issue list --search "<error message>"

# Check recent runs for patterns
gh run list --workflow <workflow-name> --limit 5
```

**For local failures:**
- Read the complete stack trace
- Identify the failing component (test, build, lint, type check)
- Note the exact error message and line numbers

### 2. Understand Root Cause

Before making changes, answer these questions:
- What is the actual error (not just symptoms)?
- What changed recently that could cause this?
- Is this a code issue, configuration issue, or environment issue?
- Have I seen this error pattern before?

**Check context:**
```bash
# Review recent commits
git log --oneline -10

# Check if issue exists in main
git checkout main && <run-failing-command>

# Review related files
cat <file-mentioned-in-error>
```

### 3. Track the Issue

Create or update a tracking issue before fixing:

```bash
# For new bugs
gh issue create --title "fix(scope): brief description" --label bug,agent-session --body "
## Error
\`\`\`
<paste error message>
\`\`\`

## Context
- Workflow/Command: <what failed>
- Branch: <branch-name>
- Related PR: #<number>

## Investigation
<what you've learned>
"

# For existing issues
gh issue comment <number> --body "Update: <progress or findings>"
```

### 4. Fix Systematically

**Make ONE change at a time:**
1. Implement the minimal fix for the root cause
2. Test locally if possible
3. Commit with descriptive message
4. Push and verify CI passes
5. Only then make additional changes

**Local testing commands:**

```bash
# TypeScript packages
cd packages/<package-name>
npm test
npm run lint
npm run build

# Python packages
cd packages/<package-name>
pytest
ruff check .
mypy .

# Go packages
cd packages/<package-name>
go test ./...
go build ./...
```

### 5. Verify and Document

After fixing:
```bash
# Verify CI passes
gh pr checks <PR_NUMBER>

# Update memory bank
cat >> memory-bank/progress.md << EOF

## $(date +%Y-%m-%d)
- Fixed: <brief description>
- Root cause: <what was wrong>
- Solution: <what was changed>
- Issue: #<number>
EOF
```

## Critical Anti-Patterns

**NEVER do these:**

❌ Make random changes hoping something works
❌ Delete code you don't understand
❌ Ignore error messages or warnings
❌ Create multiple PRs for the same issue
❌ Assume you know the problem without reading logs
❌ Copy/move files without understanding their purpose
❌ Refactor code without running tests afterward
❌ Push "fixes" without local verification
❌ Make multiple unrelated changes in one commit

### Branch Protection Violations

**ABSOLUTELY NEVER:**

❌ Bypass branch protection to merge a PR
❌ Merge without all CI checks passing
❌ Modify repository rulesets or protection settings
❌ Use admin privileges to force-merge
❌ Manually merge Dependabot PRs (automated workflow handles these)
❌ Override required reviews or status checks

**If CI fails, fix the code. Never bypass the checks.**

## Common Failure Patterns

### CI Test Failures

```bash
# Get test output
gh run view <run-id> --log | grep -A20 "FAILED\|Error"

# Run tests locally
cd packages/<package-name> && npm test  # or pytest
```

**Fix approach:** Identify failing test, understand why it fails, fix the code or test.

### Type Errors

```bash
# TypeScript
npm run type-check

# Python
mypy <file-or-directory>
```

**Fix approach:** Add proper types, fix type mismatches, or update type definitions.

### Linting Failures

```bash
# TypeScript
npm run lint

# Python
ruff check .
```

**Fix approach:** Run auto-fix if available, otherwise manually address style issues.

### Build Failures

```bash
# Get build logs
gh run view <run-id> --log | grep -A10 "build"

# Build locally
npm run build  # or go build
```

**Fix approach:** Resolve import errors, missing dependencies, or syntax issues.

### Security Scan Failures (CodeQL)

```bash
# View CodeQL results
gh pr checks <PR_NUMBER> | grep -i codeql
```

**Fix approach:** Review security findings, fix vulnerabilities, never bypass security checks.

## When Genuinely Stuck

Follow this escalation path:

1. **Re-read documentation** for the tool/library/framework involved
2. **Search upstream issues** on the relevant GitHub repository
3. **Review similar code** in the codebase that works
4. **Create a detailed issue** explaining:
   - What you're trying to do
   - What you've tried
   - Full error messages
   - Relevant code snippets
5. **Stop making changes** until you understand the problem

**DO NOT:**
- Keep trying random solutions
- Make breaking changes out of frustration
- Bypass safeguards because you're stuck
- Delete working code to "start fresh"

## Recovery from Mistakes

If you've made changes that made things worse:

```bash
# Discard local changes
git checkout -- <file>

# Reset to last commit
git reset --hard HEAD

# Reset to main branch state
git fetch origin
git reset --hard origin/main

# Close problematic PR and start fresh
gh pr close <number> --comment "Closing to restart with better approach"
```

**Then:** Start over with proper diagnosis.
