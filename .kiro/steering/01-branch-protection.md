---
inclusion: always
---

# Branch Protection Rules

## Critical Constraints

You MUST NOT perform these actions under any circumstances:

- Merge a PR without all CI checks passing
- Bypass branch protection rules or repository rulesets
- Modify repository protection settings
- Use admin privileges to force-merge
- Merge multiple PRs without waiting for CI verification between each
- Manually merge Dependabot PRs (automated workflow handles these)

## Pre-Merge Verification Checklist

Execute these checks before merging any PR:

```bash
# 1. Verify all CI checks passed
gh pr checks <PR_NUMBER>
# Expected: All checks show "pass" status

# 2. Confirm CodeQL security scan passed
gh pr checks <PR_NUMBER> | grep -i codeql
# Expected: CodeQL check shows "pass"

# 3. Check PR review status
gh pr view <PR_NUMBER>
# Expected: All review threads resolved, required reviews approved
```

All checks must pass. No exceptions.

## CI Failure Response Protocol

When CI fails, follow this sequence:

1. Retrieve failure logs: `gh run view <RUN_ID> --log-failed`
2. Identify root cause from error messages
3. Fix the underlying issue in code
4. Push fix to trigger new CI run
5. Wait for all checks to pass
6. Only then proceed with merge

Never attempt to bypass failing checks. Fix the code instead.

## Dependabot PR Handling

The `dependabot-automerge.yml` workflow automatically merges Dependabot PRs after CI passes.

Your role: Monitor for failures, do not manually merge.

## Branch Protection Purpose

These rules enforce:

- Code quality gates (tests, linting, type checking)
- Security scanning (CodeQL for vulnerabilities)
- Review requirements (human or automated feedback)
- Build verification (ensure code compiles and runs)

Bypassing protection defeats these safeguards and risks breaking the main branch.

## Admin Privilege Scope

Admin access is authorized for:

- Configuring repository settings (workflows, secrets, webhooks)
- Emergency fixes with explicit human approval
- Setting up new automation

Admin access is NOT authorized for:

- Circumventing CI requirements
- Force-merging failing PRs
- Overriding review requirements
- Merging without status checks

When in doubt, wait for CI to pass.
