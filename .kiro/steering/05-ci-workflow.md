---
inclusion: always
---

# CI/CD Workflow Guide

## Active Workflows

| Workflow | Location | Trigger | Purpose | Status Check |
|----------|----------|---------|---------|--------------|
| `ci.yml` | `.github/workflows/ci.yml` | push, pull_request | Build, test, lint, release | Required |
| `codeql.yml` | `.github/workflows/codeql.yml` | push, pull_request, schedule | Security scanning | Required |
| `claude.yml` | `.github/workflows/claude.yml` | issue_comment, pull_request_review | AI assistance (@claude mentions) | Optional |
| `claude-code-review.yml` | `.github/workflows/claude-code-review.yml` | pull_request | Automated code review | Optional |

## CI Check Requirements

Before any PR can merge, these checks MUST pass:

1. **Build** - All packages compile without errors
2. **Tests** - All unit and integration tests pass
3. **Lint** - Code style and quality checks pass
4. **CodeQL** - Security scanning shows no HIGH/CRITICAL issues
5. **Type Check** - TypeScript/Python type validation passes

## Checking CI Status

```bash
# View status of all checks for a PR
gh pr checks <PR_NUMBER>

# View detailed logs for a specific run
gh run view <RUN_ID> --log

# View failed logs only
gh run view <RUN_ID> --log-failed

# List recent workflow runs
gh run list --workflow ci.yml --limit 10

# Watch a running workflow
gh run watch <RUN_ID>
```

## Required Secrets

| Secret | Scope | Used By | Purpose | Check Exists |
|--------|-------|---------|---------|--------------|
| `GITHUB_JBCOM_TOKEN` | All workflows | All | GitHub API access | `gh secret list` |
| `NPM_TOKEN` | Release only | ci.yml | npm package publishing | `gh secret list` |
| `PYPI_TOKEN` | Release only | ci.yml | PyPI package publishing | `gh secret list` |
| `DOCKERHUB_TOKEN` | Release only | ci.yml | Docker image publishing | `gh secret list` |
| `ANTHROPIC_API_KEY` | AI workflows | claude*.yml | Claude API (disabled for cost) | `gh secret list` |

**Note**: Claude workflows are present but should NOT be triggered due to API costs on public repos.

## Workflow Modification Protocol

Before modifying any workflow file:

1. **Understand current behavior**:
   ```bash
   # Read the workflow file
   cat .github/workflows/<workflow-name>.yml
   
   # Check recent runs
   gh run list --workflow <workflow-name> --limit 5
   ```

2. **Verify secrets availability**:
   ```bash
   gh secret list
   ```

3. **Test changes in a branch**:
   - Create feature branch
   - Modify workflow
   - Push and observe run results
   - Do NOT merge if workflow fails

4. **Document changes**:
   - Use conventional commit: `ci(workflow): description`
   - Explain why the change is needed in PR description

## Release Process (Automated)

Releases are fully automated via semantic-release. The process:

1. **Trigger**: Merge PR to `main` with conventional commit message
2. **Analysis**: semantic-release analyzes commits since last release
3. **Version**: Determines version bump (major/minor/patch) from commit types
4. **Build**: Runs full CI pipeline (build, test, lint)
5. **Publish**: If CI passes, publishes to appropriate registry:
   - Python packages → PyPI
   - TypeScript packages → npm
   - Go packages → Docker Hub
6. **Tag**: Creates git tag and GitHub release

### Version Determination

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor (0.x.0) | `feat(api): add new endpoint` |
| `fix:` | Patch (0.0.x) | `fix(auth): resolve token expiry` |
| `feat!:` or `BREAKING CHANGE:` | Major (x.0.0) | `feat!: redesign API` |
| `docs:`, `chore:`, `style:` | None | `docs: update README` |

### Critical Rules

- ❌ NEVER manually edit version numbers in `package.json`, `pyproject.toml`, or `go.mod`
- ❌ NEVER manually create git tags
- ❌ NEVER manually publish packages to registries
- ✅ ALWAYS use conventional commits
- ✅ ALWAYS let semantic-release handle versioning
- ✅ ALWAYS wait for CI to complete before merging

## Debugging Failed CI

When CI fails, follow this systematic approach:

1. **Identify the failing job**:
   ```bash
   gh pr checks <PR_NUMBER>
   ```

2. **Get failure logs**:
   ```bash
   gh run view <RUN_ID> --log-failed
   ```

3. **Common failure patterns**:

   | Error Pattern | Likely Cause | Fix |
   |---------------|--------------|-----|
   | `npm ERR! code ELIFECYCLE` | Test failure | Check test output, fix failing tests |
   | `error TS2xxx` | TypeScript error | Fix type errors in code |
   | `E   assert` | Python test failure | Check pytest output, fix test |
   | `Lint failed` | Code style issue | Run linter locally, fix issues |
   | `CodeQL found issues` | Security vulnerability | Review CodeQL report, fix vulnerability |

4. **Test locally before pushing**:
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
   ```

5. **Push fix and verify**:
   - Commit with descriptive message
   - Push to branch
   - Wait for CI to run
   - Verify all checks pass

## Monorepo CI Behavior

This monorepo contains multiple packages. CI behavior:

- **All packages tested**: CI runs tests for all packages on every push
- **Selective release**: Only packages with changes since last release are published
- **Independent versions**: Each package has its own version number
- **Shared workflows**: All packages use the same CI configuration

## Cost Awareness

This is a PUBLIC repository with free CI/CD:

- ✅ GitHub Actions: Unlimited minutes for public repos
- ✅ CodeQL: Free security scanning
- ✅ Dependabot: Free dependency updates
- ❌ Anthropic API: Costs money, avoid triggering Claude workflows
- ❌ Paid services: Do not add paid integrations

## Workflow Troubleshooting

If workflows are not triggering:

1. **Check workflow file syntax**:
   ```bash
   # Validate YAML syntax
   cat .github/workflows/<name>.yml | yq eval
   ```

2. **Verify trigger conditions**:
   - Check `on:` section matches your action (push, pull_request, etc.)
   - Verify branch filters if present

3. **Check workflow is enabled**:
   ```bash
   gh workflow list
   ```

4. **Review workflow permissions**:
   - Ensure `GITHUB_TOKEN` has required permissions
   - Check if workflow requires specific secrets
