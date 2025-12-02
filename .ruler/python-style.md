# Python Package Guidelines

## Type Hints (Required)

```python
# ✅ Modern style
from collections.abc import Mapping, Sequence

def process(items: list[dict[str, Any]]) -> dict[str, int]:
    return {"count": len(items)}

# ❌ Legacy style - don't use
from typing import Dict, List  # Deprecated
```

## Pathlib (Always)

```python
# ✅ Correct
from pathlib import Path
config = Path("config.yaml")
content = config.read_text()

# ❌ Wrong
import os
config = os.path.join("config.yaml")
```

## Dependencies

Use `extended-data-types` utilities before adding new dependencies:
- `strtobool`, `strtopath` - type conversions
- `encode_json`, `decode_yaml` - serialization
- `make_raw_data_export_safe` - sanitize for logging

## Testing

Every function needs:
- Happy path test
- Edge case test (empty input, invalid input)
- Type annotations
