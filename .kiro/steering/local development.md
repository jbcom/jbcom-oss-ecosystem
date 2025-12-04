---
inclusion: always
---

# Local Development Guide

## Monorepo Structure

This is a multi-language monorepo managed with workspace tools:

- **Python packages**: Use `uv` for dependency management
- **TypeScript/JavaScript packages**: Use `pnpm` for dependency management
- **Go packages**: Use standard Go modules

## Local Testing Commands

Before pushing changes, run tests locally to catch issues early:

### Python Packages

```bash
cd packages/<package-name>

# Run tests
pytest

# Run linting
ruff check .

# Run type checking
mypy .

# Run all checks
pytest && ruff check . && mypy .
```

### TypeScript Packages

```bash
cd packages/<package-name>

# Install dependencies (if needed)
pnpm install

# Run tests
pnpm test

# Run linting
pnpm run lint

# Run type checking
pnpm run type-check

# Build package
pnpm run build

# Run all checks
pnpm test && pnpm run lint && pnpm run build
```

### Go Packages

```bash
cd packages/<package-name>

# Run tests
go test ./...

# Run linting
golangci-lint run

# Build
go build ./...

# Run all checks
go test ./... && go build ./...
```

## Development Workflow

1. **Start with context**: Read `memory-bank/activeContext.md` to understand current work
2. **Create tracking issue**: Use `gh issue create` for all new work
3. **Create feature branch**: Branch from `main` with descriptive name
4. **Make minimal changes**: Focus on one concern at a time
5. **Test locally**: Run package-specific tests before pushing
6. **Commit with convention**: Use conventional commits for semantic versioning
7. **Push and verify CI**: Wait for all checks to pass
8. **Update memory bank**: Document progress before ending session

## Common Development Tasks

### Adding Dependencies

**Python (using uv):**
```bash
cd packages/<package-name>
uv add <package-name>
```

**TypeScript (using pnpm):**
```bash
cd packages/<package-name>
pnpm add <package-name>
```

**Go:**
```bash
cd packages/<package-name>
go get <package-name>
```

### Running Specific Tests

**Python:**
```bash
pytest tests/test_specific.py::test_function
```

**TypeScript:**
```bash
pnpm test -- tests/specific.test.ts
```

**Go:**
```bash
go test -run TestSpecificFunction ./...
```

### Debugging Test Failures

1. Read the complete error message
2. Run the failing test in isolation
3. Add debug output if needed
4. Fix the root cause, not symptoms
5. Verify fix locally before pushing

## Code Quality Standards

### Python

- Use type hints for all function signatures
- Follow PEP 8 style (enforced by ruff)
- Write docstrings for public APIs
- Maintain test coverage above 80%

### TypeScript

- Use strict TypeScript mode
- Prefer explicit types over `any`
- Use functional patterns where appropriate
- Write unit tests for business logic

### Go

- Follow Go idioms and conventions
- Use `gofmt` for formatting
- Write table-driven tests
- Handle errors explicitly

## Performance Considerations

- **Avoid unnecessary file operations**: Read files once, cache when appropriate
- **Batch operations**: Group related changes into single commits
- **Minimize CI runs**: Test locally before pushing
- **Use incremental builds**: Leverage package managers' caching

## Debugging CI Failures

When CI fails:

1. **Get logs**: `gh run view <RUN_ID> --log-failed`
2. **Identify failure**: Read error messages completely
3. **Reproduce locally**: Run the same command that failed in CI
4. **Fix root cause**: Don't guess, understand the problem
5. **Verify fix**: Test locally, then push
6. **Wait for CI**: Confirm all checks pass

## File Organization

- **Source code**: `packages/<package-name>/src/`
- **Tests**: `packages/<package-name>/tests/` or `packages/<package-name>/__tests__/`
- **Configuration**: Package root (e.g., `pyproject.toml`, `package.json`)
- **Documentation**: `packages/<package-name>/README.md`

## Environment Setup

### Required Tools

- **Python**: Python 3.11+ with `uv` installed
- **Node.js**: Node 18+ with `pnpm` installed
- **Go**: Go 1.21+ (for vault-secret-sync)
- **GitHub CLI**: `gh` for issue/PR management

### Verification

```bash
# Check tool versions
python --version
uv --version
node --version
pnpm --version
go version
gh --version
```

## Common Pitfalls

- ❌ Don't modify version numbers manually (semantic-release handles this)
- ❌ Don't bypass CI checks or branch protection
- ❌ Don't make multiple unrelated changes in one commit
- ❌ Don't push without running tests locally
- ❌ Don't ignore linting or type errors
- ✅ Do use conventional commits
- ✅ Do test locally before pushing
- ✅ Do update memory bank with progress
- ✅ Do create tracking issues for work

## Package-Specific Notes

### otterfall (Game)

- Uses React Three Fiber for 3D rendering
- Run dev server: `pnpm run dev` (manual, not in CI)
- E2E tests use Playwright
- Audio files in `public/audio/`

### agentic-control

- TypeScript CLI tool
- Uses Anthropic API (requires key)
- Test with mock clients when possible

### vault-secret-sync

- Go-based Kubernetes operator
- Requires Docker for container builds
- Helm charts in `deploy/charts/`

## Quick Reference

| Task | Command |
|------|---------|
| Check context | `cat memory-bank/activeContext.md` |
| List issues | `gh issue list --label agent-session` |
| Create issue | `gh issue create --title "feat: description"` |
| Check CI status | `gh pr checks <PR_NUMBER>` |
| View CI logs | `gh run view <RUN_ID> --log-failed` |
| Run Python tests | `cd packages/<name> && pytest` |
| Run TS tests | `cd packages/<name> && pnpm test` |
| Run Go tests | `cd packages/<name> && go test ./...` | 