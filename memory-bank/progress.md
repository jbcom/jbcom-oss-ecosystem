# Progress

## 2025-12-02

- Nuked all ruler/agentic config mess
- Created clean .cursor/rules/00-start-here.mdc
- Created clean memory-bank/
- Tracking issue #21 exists

### Root cause identified
Agents had overlapping, conflicting instructions from:
- .ruler/*.md
- .cursor/rules/*.mdc
- Generated files

Now: ONE source of truth in .cursor/rules/
