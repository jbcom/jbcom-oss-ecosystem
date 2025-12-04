# Quality Standards - No Shortcuts

## Core Principle

**NEVER take shortcuts that leave work for the future.** Complete features properly the first time.

## Implementation Standards

### Complete, Not Partial
- ✅ Implement ALL requirements in the task
- ✅ Handle ALL edge cases
- ✅ Add proper error handling
- ✅ Write complete, production-ready code
- ❌ NO placeholders or TODOs
- ❌ NO "we'll add this later"
- ❌ NO incomplete implementations

### Proper Error Handling
```typescript
// ❌ BAD - Silent failure
try {
    doSomething();
} catch (e) {
    // ignored
}

// ✅ GOOD - Proper handling
try {
    doSomething();
} catch (e) {
    console.error('Failed to do something:', e);
    // Fallback behavior or rethrow
}
```

### No Mock/Stub Shortcuts
- ❌ Don't use mocks to make tests pass
- ❌ Don't stub out functionality "temporarily"
- ✅ Implement real functionality
- ✅ Tests should validate actual behavior

### Complete Type Safety
```typescript
// ❌ BAD - Using 'any'
function process(data: any) { }

// ✅ GOOD - Proper types
interface ResourceData {
    name: string;
    icon: string;
    type: ResourceType;
}
function process(data: ResourceData) { }
```

### Proper State Management
- ✅ All state changes go through proper channels (stores, ECS)
- ✅ State is synchronized correctly
- ✅ No race conditions or timing issues
- ❌ No direct DOM manipulation bypassing React
- ❌ No global variables as shortcuts

### Integration, Not Isolation
- ✅ New features integrate with existing systems
- ✅ All components wire together properly
- ✅ No orphaned code
- ❌ Don't create parallel systems
- ❌ Don't duplicate functionality

## Testing Standards

### Tests Must Be Real
```typescript
// ❌ BAD - Mocked to always pass
test('should work', () => {
    const mock = jest.fn(() => true);
    expect(mock()).toBe(true);
});

// ✅ GOOD - Tests real behavior
test('should collect resource when nearby', () => {
    const player = createPlayer({ x: 0, y: 0 });
    const resource = createResource({ x: 1, y: 0 });
    collectResources(player, [resource]);
    expect(player.health).toBeGreaterThan(initialHealth);
});
```

### Test Coverage
- ✅ Test happy path
- ✅ Test error cases
- ✅ Test edge cases (empty, null, boundary values)
- ✅ Test integration between components
- ❌ Don't skip tests because "it's obvious"

## Code Quality

### Readable and Maintainable
```typescript
// ❌ BAD - Magic numbers
if (distance < 1.5) { }

// ✅ GOOD - Named constants
const COLLECTION_DISTANCE = 1.5;
if (distance < COLLECTION_DISTANCE) { }
```

### DRY (Don't Repeat Yourself)
- ✅ Extract common logic into functions
- ✅ Use constants for repeated values
- ✅ Create reusable components
- ❌ Don't copy-paste code

### Consistent Patterns
- ✅ Follow existing code patterns in the project
- ✅ Use the same state management approach
- ✅ Match existing naming conventions
- ❌ Don't introduce new patterns without reason

## Documentation Standards

### Self-Documenting Code
```typescript
// ❌ BAD - Unclear
function p(x: number) { return x * 2; }

// ✅ GOOD - Clear intent
function calculateDoubleSpeed(baseSpeed: number) {
    return baseSpeed * 2;
}
```

### Comments When Needed
```typescript
// ✅ GOOD - Explain WHY, not WHAT
// Use try-catch because audio manager may not be initialized in tests
try {
    audioManager.play();
} catch (e) { }
```

### Update Documentation
- ✅ Update memory bank with what was completed
- ✅ Document any non-obvious decisions
- ✅ Note any dependencies or requirements
- ❌ Don't leave stale comments

## Performance Standards

### Efficient from the Start
- ✅ Use proper data structures (Map vs Array for lookups)
- ✅ Avoid unnecessary re-renders
- ✅ Clean up resources (intervals, listeners)
- ❌ Don't write slow code "to optimize later"

### Memory Management
```typescript
// ✅ GOOD - Cleanup
useEffect(() => {
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
}, []);
```

## When You're Tempted to Take a Shortcut

### Ask Yourself:
1. **Will this create technical debt?** → Don't do it
2. **Will someone need to fix this later?** → Do it right now
3. **Am I avoiding this because it's hard?** → That's exactly why you should do it
4. **Is this a placeholder?** → Write the real implementation
5. **Will this work in production?** → If not, fix it

### The Right Approach:
1. **Understand the requirement fully**
2. **Design the proper solution**
3. **Implement it completely**
4. **Test it thoroughly**
5. **Document it clearly**

## Enforcement

### Before Marking Task Complete:
- [ ] All requirements implemented
- [ ] All edge cases handled
- [ ] All tests passing
- [ ] No TODOs or placeholders
- [ ] No shortcuts taken
- [ ] Code is production-ready
- [ ] Documentation updated

### If You Can't Complete Properly:
1. **Stop and ask the user** - Don't guess
2. **Explain what's blocking you** - Be specific
3. **Propose a complete solution** - Not a workaround
4. **Wait for guidance** - Don't proceed with shortcuts

## Remember

**Technical debt compounds.** Every shortcut you take now becomes:
- A bug someone has to fix later
- A feature someone has to complete later
- A refactor someone has to do later
- A test someone has to write later

**Do it right the first time.** Your future self (and the user) will thank you.
