# extended-data-types

Foundation utilities library. All other Python packages depend on this.

## Key Exports

- **Type conversions**: `strtobool`, `strtopath`, `strtoint`
- **JSON/YAML**: `encode_json`, `decode_yaml`, `decode_json`
- **Data safety**: `make_raw_data_export_safe`
- **Transformations**: `camelize`, `underscore`, `dasherize`

## Rules

1. NO external dependencies except: `orjson`, `ruamel.yaml`, `inflection`
2. All functions must have type hints
3. All public functions need docstrings
4. This is the foundation - changes affect ALL packages
