# Go Package Guidelines

## Error Handling

```go
// ✅ Always check errors
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doSomething failed: %w", err)
}

// ✅ Use errors.Is/As for comparison
if errors.Is(err, ErrNotFound) { ... }
```

## Logging

Use structured logging:
```go
log.Info("syncing secrets", 
    "source", sourcePath,
    "destination", destPath,
    "count", len(secrets))
```

## Testing

```go
func TestSomething(t *testing.T) {
    t.Run("happy path", func(t *testing.T) { ... })
    t.Run("error case", func(t *testing.T) { ... })
}
```
