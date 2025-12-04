---
inclusion: always
---

# External Rules Repository

This workspace follows centralized coding standards maintained in a separate repository.

## Rules Location

**Repository**: https://github.com/jbcom/cursor-rules

These rules define organization-wide conventions for:
- Code style and formatting
- Architecture patterns
- Testing standards
- Documentation requirements
- Git workflow practices

## When to Reference

Reference external rules when:
- Starting work on a new feature or package
- Uncertain about code style or architecture decisions
- Implementing cross-cutting concerns (logging, error handling, etc.)
- Setting up new tooling or CI/CD configurations

## How to Access

If you need to review the complete standards:

```bash
# Clone to temporary location
git clone https://github.com/jbcom/cursor-rules /tmp/cursor-rules

# Review relevant sections
cat /tmp/cursor-rules/README.md
```

## Precedence

When conflicts exist between rules:
1. **Workspace-level steering** (`.kiro/steering/*.md`) takes highest precedence
2. **External rules repository** provides fallback guidance
3. **Language/framework conventions** apply when not specified elsewhere

## Note for AI Assistants

The external rules repository is a reference resource. Do not automatically clone or read it unless:
- Explicitly asked by the user
- Encountering an ambiguous situation not covered by workspace steering
- User requests adherence to organization-wide standards

Workspace-specific steering documents (00-start-here.md, 01-branch-protection.md, etc.) already incorporate the most critical rules for this repository.
