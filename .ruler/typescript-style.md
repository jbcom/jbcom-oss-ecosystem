# TypeScript Package Guidelines

## Strict Mode

All packages use strict TypeScript:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## Error Handling

```typescript
// ✅ Use Result types for expected errors
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// ✅ Throw for unexpected errors only
throw new Error("Invariant violated: ...");
```

## Exports

Use explicit named exports:
```typescript
// ✅ src/index.ts
export { Fleet } from "./fleet/index.js";
export { Triage } from "./triage/index.js";
export type { FleetConfig } from "./types.js";
```
