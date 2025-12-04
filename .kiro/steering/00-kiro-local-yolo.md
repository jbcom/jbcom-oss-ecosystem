# Kiro Local YOLO Development

## Core Philosophy

This is LOCAL development with NO CI/CD gates, NO branch protection, NO GitHub tokens. You work directly on the codebase, test locally, and commit when ready.

## Development Flow

1. **Read the task** from `.kiro/specs/{feature}/tasks.md`
2. **Implement the code** - write all necessary files
3. **Test locally** - run tests with `pnpm test --run` or `pytest`
4. **Commit when done** - use conventional commits
5. **Move to next task** - ONE task at a time

## Key Rules

### DO:
- ✅ Work on ONE task at a time
- ✅ Test locally before committing
- ✅ Use `pnpm` for TypeScript packages
- ✅ Use `uv` for Python packages
- ✅ Read requirements and design docs to understand context
- ✅ Update memory bank with progress
- ✅ Commit with conventional commit messages

### DON'T:
- ❌ Try to use GitHub MCP or create PRs (no tokens configured)
- ❌ Worry about CI/CD (not set up yet)
- ❌ Try to push to remote (local development only)
- ❌ Work on multiple tasks simultaneously
- ❌ Skip testing before moving to next task

## Testing Commands

### TypeScript (Otterfall)
```bash
cd packages/otterfall
pnpm test --run              # Unit tests
pnpm run lint                # Linting
pnpm run build               # Build check
```

### Python
```bash
cd packages/{package-name}
pytest                       # Unit tests
ruff check .                 # Linting
mypy .                       # Type checking
```

## Task Execution

When implementing a task:

1. **Mark task as in_progress** using taskStatus tool
2. **Read all relevant files** (requirements, design, existing code)
3. **Implement the feature** completely
4. **Test the implementation** locally
5. **Mark task as completed** using taskStatus tool
6. **STOP** - let user review before continuing

## Memory Bank

Update `memory-bank/{feature}-progress.md` with:
- What was completed
- What files were modified
- Any issues encountered
- Next steps

## No External Dependencies

- No GitHub tokens
- No CI/CD pipelines
- No remote pushes
- No PR creation
- Just local code, local tests, local commits

## Focus on Implementation

Your job is to:
1. Implement features according to specs
2. Write tests that validate correctness
3. Ensure code works locally
4. Document progress

That's it. Keep it simple.
