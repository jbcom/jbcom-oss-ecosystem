# jbcom OSS Ecosystem

Welcome to the jbcom open-source ecosystem! This monorepo contains unified SDK packages for infrastructure automation.

## 📦 Packages

| Package | Language | Registry | Description |
|---------|----------|----------|-------------|
| `extended-data-types` | Python | PyPI | Foundation utilities for data transformation |
| `lifecyclelogging` | Python | PyPI | Structured lifecycle logging |
| `directed-inputs-class` | Python | PyPI | Declarative input validation |
| `python-terraform-bridge` | Python | PyPI | Terraform integration utilities |
| `vendor-connectors` | Python | PyPI | Cloud vendor SDK wrappers |
| `agentic-control` | TypeScript | npm | AI agent fleet orchestration |
| `vault-secret-sync` | Go | Docker/Helm | Kubernetes secret synchronization |

## 🔧 Development

```bash
# Clone
git clone https://github.com/jbcom/jbcom-oss-ecosystem.git
cd jbcom-oss-ecosystem

# Python packages
uv sync
uv run pytest

# TypeScript
pnpm install
pnpm -C packages/agentic-control build

# Go
cd packages/vault-secret-sync && go test ./...
```

## 🚀 Release Process

This repo uses **python-semantic-release** with conventional commits:

| Commit | Version Bump | Example |
|--------|--------------|---------|
| `fix(edt):` | Patch | 1.0.0 → 1.0.1 |
| `feat(edt):` | Minor | 1.0.0 → 1.1.0 |
| `feat(edt)!:` | Major | 1.0.0 → 2.0.0 |

**Scopes**: `edt`, `logging`, `dic`, `bridge`, `connectors`, `agentic`, `vss`

## 🤝 Contributing

1. Fork and clone
2. Create feature branch: `git checkout -b feat/your-feature`
3. Make changes with tests
4. Commit with conventional format: `feat(scope): description`
5. Open PR

See package-specific guidelines in each `packages/*/` directory.

## 📜 License

MIT
