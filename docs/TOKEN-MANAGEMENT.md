# Token Management

## Overview

This repository supports working with multiple GitHub organizations. Each organization can have its own token configured.

| Organization | Token Env Var | Use Case |
|--------------|---------------|----------|
| jbcom | `GITHUB_JBCOM_TOKEN` | OSS packages and repos |

## Configuration

### Environment Variables

```bash
# Required for jbcom organization
export GITHUB_JBCOM_TOKEN="ghp_..."

# Optional (defaults to GITHUB_JBCOM_TOKEN)
export GITHUB_TOKEN="$GITHUB_JBCOM_TOKEN"
```

### agentic.config.json

```json
{
  "tokens": {
    "organizations": {
      "jbcom": {
        "name": "jbcom",
        "tokenEnvVar": "GITHUB_JBCOM_TOKEN"
      }
    },
    "defaultTokenEnvVar": "GITHUB_TOKEN",
    "prReviewTokenEnvVar": "GITHUB_JBCOM_TOKEN"
  }
}
```

### Adding Additional Organizations

To add a new organization, add an entry to `agentic.config.json`:

```json
{
  "tokens": {
    "organizations": {
      "my-org": {
        "name": "my-org",
        "tokenEnvVar": "GITHUB_MY_ORG_TOKEN"
      }
    }
  }
}
```

## Automatic Token Switching

The `agentic-control` CLI automatically selects the correct token based on repository organization:

```bash
# Uses GITHUB_JBCOM_TOKEN
agentic github pr create --repo jbcom/extended-data-types
```

### How It Works

1. Parse repository URL to extract organization
2. Look up organization in `agentic.config.json`
3. Read token from specified environment variable
4. Use token for API calls

### PR Reviews Exception

**PR reviews ALWAYS use `prReviewTokenEnvVar`**, regardless of target repo.

This ensures consistent identity across all operations.

## Manual Token Usage

When using `gh` CLI directly:

```bash
# jbcom repos
GH_TOKEN="$GITHUB_JBCOM_TOKEN" gh pr create ...
```

## Token Permissions

### Required Scopes

- `repo` - Full repository access
- `workflow` - GitHub Actions
- `write:packages` - Package publishing

## Security

### DO
- Store tokens in environment variables
- Use `agentic.config.json` for organization mapping
- Let `agentic-control` handle token selection

### DON'T
- Hardcode tokens in code
- Commit tokens to git
- Log token values
- Share tokens across machines

## Troubleshooting

### "Bad credentials"

Token is invalid or expired. Generate a new one at:
https://github.com/settings/tokens

### "Resource not accessible"

Token lacks required scopes. Check permissions and regenerate if needed.

### "Organization access denied"

Ensure:
1. Token has org access enabled
2. SSO authorization completed (if required by org)

## Related

- [`agentic.config.json`](/agentic.config.json) - Token configuration
- [`packages/agentic-control/`](/packages/agentic-control/) - Token switching implementation
