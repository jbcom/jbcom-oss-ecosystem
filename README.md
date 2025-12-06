# jbcom OSS Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Unified SDK for infrastructure automation** — Python, TypeScript, and Go packages.

> **Note**: Packages have been migrated to individual repositories for improved PR management and development workflows.

## 📦 Package Repositories

### Python (PyPI)

| Package | Repository | Description |
|---------|------------|-------------|
| `extended-data-types` | [jbcom/extended-data-types](https://github.com/jbcom/extended-data-types) | Foundation utilities for data transformation |
| `lifecyclelogging` | [jbcom/lifecyclelogging](https://github.com/jbcom/lifecyclelogging) | Structured lifecycle logging |
| `directed-inputs-class` | [jbcom/directed-inputs-class](https://github.com/jbcom/directed-inputs-class) | Declarative input validation |
| `python-terraform-bridge` | [jbcom/python-terraform-bridge](https://github.com/jbcom/python-terraform-bridge) | Terraform integration utilities |
| `vendor-connectors` | [jbcom/vendor-connectors](https://github.com/jbcom/vendor-connectors) | Cloud vendor SDK wrappers (includes Meshy AI) |

### TypeScript (npm)

| Package | Repository | Description |
|---------|------------|-------------|
| `agentic-control` | [jbcom/agentic-control](https://github.com/jbcom/agentic-control) | AI agent fleet orchestration + CrewAI companion |
| `@jbcom/strata` | [jbcom/strata](https://github.com/jbcom/strata) | Procedural 3D graphics for React Three Fiber |

### Apps

| App | Repository | Description |
|-----|------------|-------------|
| `otterfall` | [jbcom/otterfall](https://github.com/jbcom/otterfall) | Mobile-first 3D exploration game (Capacitor) |

### Go (Docker/Helm)

| Package | Repository | Description |
|---------|------------|-------------|
| `vault-secret-sync` | [jbcom/vault-secret-sync](https://github.com/jbcom/vault-secret-sync) | Kubernetes secret synchronization |

## 🚀 Quick Start

### Python

```bash
pip install extended-data-types lifecyclelogging vendor-connectors
```

```python
from extended_data_types import encode_json, decode_yaml
from lifecyclelogging import Logger
from vendor_connectors import AWSConnector
from vendor_connectors.meshy import text3d  # Meshy AI 3D generation

logger = Logger("myapp")
aws = AWSConnector()
model = text3d.generate("a medieval sword")
```

### TypeScript

```bash
npm install agentic-control @jbcom/strata
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

## 📝 Migration Notes

All packages have been migrated to individual repositories:

- **Why**: Improved PR management, clearer CI/CD pipelines, better development synergies
- **How**: Each package now has its own CI, releases, and issue tracking
- **Merged packages**:
  - `mesh-toolkit` → merged into `vendor-connectors` as `meshy` submodule
  - `internal/crewai` → merged into `agentic-control` as Python companion

Each repository includes:
- Standardized CI/CD workflows
- `memory-bank/` for agent context
- `AGENTS.md` for development guidance
- `.cursor/rules/` for Cursor AI

## 🤝 Contributing

1. Find the relevant package repository above
2. Fork that repository
3. Create a feature branch: `git checkout -b feat/amazing-feature`
4. Make your changes with tests
5. Commit with conventional format: `feat(scope): description`
6. Open a Pull Request

## 📜 License

[MIT](./LICENSE) © jbcom
