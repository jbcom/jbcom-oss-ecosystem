# jbcom OSS Ecosystem

[![CI](https://github.com/jbcom/jbcom-oss-ecosystem/actions/workflows/ci.yml/badge.svg)](https://github.com/jbcom/jbcom-oss-ecosystem/actions/workflows/ci.yml)
[![CodeQL](https://github.com/jbcom/jbcom-oss-ecosystem/actions/workflows/codeql.yml/badge.svg)](https://github.com/jbcom/jbcom-oss-ecosystem/security/code-scanning)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Unified SDK for infrastructure automation** — Python, TypeScript, and Go packages in one monorepo.

## 📦 Packages

### Python (PyPI)

| Package | Version | Description |
|---------|---------|-------------|
| [`extended-data-types`](./packages/extended-data-types) | [![PyPI](https://img.shields.io/pypi/v/extended-data-types)](https://pypi.org/project/extended-data-types/) | Foundation utilities for data transformation |
| [`lifecyclelogging`](./packages/lifecyclelogging) | [![PyPI](https://img.shields.io/pypi/v/lifecyclelogging)](https://pypi.org/project/lifecyclelogging/) | Structured lifecycle logging |
| [`directed-inputs-class`](./packages/directed-inputs-class) | [![PyPI](https://img.shields.io/pypi/v/directed-inputs-class)](https://pypi.org/project/directed-inputs-class/) | Declarative input validation |
| [`python-terraform-bridge`](./packages/python-terraform-bridge) | [![PyPI](https://img.shields.io/pypi/v/python-terraform-bridge)](https://pypi.org/project/python-terraform-bridge/) | Terraform integration utilities |
| [`vendor-connectors`](./packages/vendor-connectors) | [![PyPI](https://img.shields.io/pypi/v/vendor-connectors)](https://pypi.org/project/vendor-connectors/) | Cloud vendor SDK wrappers |

### TypeScript (npm)

| Package | Version | Description |
|---------|---------|-------------|
| [`agentic-control`](./packages/agentic-control) | [![npm](https://img.shields.io/npm/v/agentic-control)](https://www.npmjs.com/package/agentic-control) | AI agent fleet orchestration |

### Go (Docker/Helm)

| Package | Version | Description |
|---------|---------|-------------|
| [`vault-secret-sync`](./packages/vault-secret-sync) | [![Docker](https://img.shields.io/docker/v/jbcom/vault-secret-sync)](https://hub.docker.com/r/jbcom/vault-secret-sync) | Kubernetes secret synchronization |

## 🚀 Quick Start

### Python

```bash
pip install extended-data-types lifecyclelogging vendor-connectors
```

```python
from extended_data_types import encode_json, decode_yaml
from lifecyclelogging import Logger
from vendor_connectors import AWSConnector

logger = Logger("myapp")
aws = AWSConnector()
```

### TypeScript

```bash
npm install agentic-control
```

```typescript
import { Fleet, Triage } from 'agentic-control';

const fleet = new Fleet();
await fleet.spawn({ repository: 'owner/repo', task: 'Fix CI' });
```

### Go / Kubernetes

```bash
# Helm
helm install vault-secret-sync oci://docker.io/jbcom/vault-secret-sync

# Docker
docker run jbcom/vault-secret-sync
```

## 🔧 Development

```bash
# Clone
git clone https://github.com/jbcom/jbcom-oss-ecosystem.git
cd jbcom-oss-ecosystem

# Python (using uv)
uv sync
uv run pytest

# TypeScript (using pnpm)
pnpm install
pnpm -C packages/agentic-control build

# Go
cd packages/vault-secret-sync
go test ./...
```

## 📝 Release Process

This repo uses **python-semantic-release** with conventional commits:

```bash
feat(edt): add new utility    # Minor bump (1.0.0 → 1.1.0)
fix(edt): resolve bug         # Patch bump (1.0.0 → 1.0.1)
feat(edt)!: breaking change   # Major bump (1.0.0 → 2.0.0)
```

**Scopes**: `edt`, `logging`, `dic`, `bridge`, `connectors`, `agentic`, `vss`

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes with tests
4. Commit with conventional format: `feat(scope): description`
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📜 License

[MIT](./LICENSE) © jbcom
