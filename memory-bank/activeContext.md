# Active Context - jbcom OSS Ecosystem

## Current Status: STABILIZING ✅

### CI
- Python packages: ✅ All passing
- agentic-control: ✅ Passing  
- vault-secret-sync: 🔄 Fixed (reverted incompatible vault 1.21.0 bump)
- CodeQL: ✅ Running

### Recent Fixes (2025-12-02)
1. Removed Claude workflows (cost money on personal repos)
2. Fixed workflow permissions for PR approval
3. Simplified ruleset to FREE tooling only
4. Added CONTRIBUTING.md
5. Reverted breaking vault dependency bump

### FREE Tooling in Use
- ✅ CodeQL - automatic security scanning
- ✅ Copilot - code review (free for public repos)
- ✅ Dependabot - dependency updates
- ✅ GitHub Actions - unlimited CI

### Do NOT Use (costs money)
- ❌ Claude Code Action
- ❌ /gemini review
- ❌ /q review

## For Next Agent

1. Wait for CI to go green
2. Check if any Dependabot PRs need manual review
3. Update this file with your session summary

---
*Updated: 2025-12-02*
