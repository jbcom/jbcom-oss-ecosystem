# directed-inputs-class

Declarative input validation using dataclasses.

## Dependencies

- `extended-data-types` (workspace)

## Usage Pattern

```python
from directed_inputs_class import DirectedInputs

@directed_inputs
class MyConfig:
    host: str
    port: int = 8080
```
