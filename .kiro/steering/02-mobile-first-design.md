# Mobile-First Design for Capacitor Games

## Core Principle

**This is a MOBILE game built with React + Capacitor.** Every feature MUST work on touch devices FIRST. Desktop/keyboard is secondary.

## Critical Rules

### Input Design
- ❌ NEVER gate features on keyboard keys ("Press E", "Press C", etc.)
- ✅ ALWAYS design for touch-first interaction
- ✅ Keyboard shortcuts are OPTIONAL enhancements, not requirements
- ✅ Every action must be accessible via touch

### Touch Interaction Patterns

**Good Touch Patterns:**
- **Tap** - Primary action (collect, select, confirm)
- **Long press** - Secondary action (context menu, details)
- **Swipe** - Navigation, dismiss
- **Pinch** - Zoom in/out
- **Two-finger tap** - Alternative action
- **Drag** - Move, reorder

**Bad Touch Patterns:**
- ❌ Complex multi-finger gestures (hard to discover)
- ❌ Precise timing requirements (frustrating on touch)
- ❌ Small touch targets (<44px)
- ❌ Gestures that conflict with system gestures

### UI Design for Mobile

**Touch Targets:**
- Minimum 44x44px (iOS guideline)
- Prefer 48x48px or larger
- Add padding around interactive elements
- Ensure adequate spacing between targets

**Layout Considerations:**
- **Portrait mode** - Primary orientation for phones
- **Landscape mode** - Secondary, must still work
- **Tablet/Foldable** - Larger screen real estate
- **Foldable transition** - Handle screen size changes gracefully

**Responsive Breakpoints:**
```typescript
// Phone portrait
width < 600px, height > width

// Phone landscape / Small tablet
600px <= width < 900px

// Tablet
900px <= width < 1200px

// Foldable (unfolded)
width >= 1200px, aspect ratio ~1:1

// Desktop
width >= 1200px, has mouse/keyboard
```

### Aspect Ratio Handling

**Phone Portrait (9:16 to 9:21):**
- Vertical layout
- Bottom navigation/controls
- Minimize top UI (notch/camera)
- Thumb-reachable zones

**Phone Landscape (16:9 to 21:9):**
- Horizontal layout
- Side controls
- Maximize game viewport
- Consider safe areas

**Tablet/Foldable (4:3 to 16:10):**
- More screen real estate
- Can show more UI simultaneously
- Larger touch targets
- Multi-column layouts possible

**Foldable Transitions:**
- Detect screen size changes
- Gracefully reflow UI
- Preserve game state
- Don't interrupt gameplay

### Control Schemes

**Movement:**
- ✅ Virtual joystick (appears on touch)
- ✅ Drag to move
- ✅ Tap to move (point-and-click)
- ❌ WASD/Arrow keys only

**Actions:**
- ✅ On-screen buttons
- ✅ Tap on target (direct manipulation)
- ✅ Context-sensitive buttons
- ❌ Keyboard shortcuts only

**Camera:**
- ✅ Pinch to zoom
- ✅ Two-finger drag to rotate
- ✅ Tap to focus
- ❌ Mouse wheel only

### Example: Resource Collection

**❌ BAD - Keyboard-only:**
```typescript
// Shows "Press E to collect"
// Requires keyboard
// Doesn't work on mobile
```

**✅ GOOD - Touch-first:**
```typescript
// Tap directly on resource to collect
// Shows visual feedback (highlight, pulse)
// Optional: Show floating button near resource
// Keyboard 'E' as optional shortcut
```

### UI Patterns for Mobile Games

**HUD Elements:**
- Top corners: Status (health, time, score)
- Bottom corners: Primary actions
- Center bottom: Movement controls
- Edges: Minimize to avoid accidental touches

**Menus:**
- Full-screen overlays
- Large, clear buttons
- Swipe to dismiss
- Back button in top-left (iOS) or hardware back (Android)

**Notifications:**
- Toast messages (auto-dismiss)
- Non-blocking
- Clear, concise text
- Large enough to read quickly

**Dialogs:**
- Center screen
- Dim background
- Clear primary action
- Easy to dismiss

### Performance Considerations

**Mobile Constraints:**
- Limited GPU (compared to desktop)
- Battery life matters
- Thermal throttling
- Variable screen refresh rates

**Optimization:**
- Target 60 FPS on mid-range devices (iPhone 13 equivalent)
- Reduce particle counts on mobile
- Use LOD aggressively
- Minimize draw calls
- Efficient touch event handling

### Testing Requirements

**Before marking ANY task complete:**
- [ ] Works with touch input
- [ ] Works in portrait mode
- [ ] Works in landscape mode
- [ ] Touch targets are large enough
- [ ] No keyboard-only features
- [ ] Tested on mobile viewport (Chrome DevTools)
- [ ] Handles screen rotation
- [ ] Handles safe areas (notch, home indicator)

### Capacitor-Specific

**Platform Detection:**
```typescript
import { Capacitor } from '@capacitor/core';

const isMobile = Capacitor.isNativePlatform();
const platform = Capacitor.getPlatform(); // 'ios', 'android', 'web'
```

**Safe Areas:**
```css
/* iOS safe areas */
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

**Haptic Feedback:**
```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Provide tactile feedback for actions
await Haptics.impact({ style: ImpactStyle.Light });
```

## Common Mistakes to Avoid

### ❌ Desktop-First Thinking
```typescript
// BAD: Keyboard-centric
<div>Press E to collect</div>
<div>Press ESC to pause</div>
<div>Use WASD to move</div>
```

### ✅ Mobile-First Thinking
```typescript
// GOOD: Touch-centric with keyboard as enhancement
<button onClick={collect}>Tap to Collect</button>
<button onClick={pause}>⏸</button>
<VirtualJoystick onMove={handleMove} />
```

### ❌ Small Touch Targets
```typescript
// BAD: 20px button
<button style={{ width: '20px', height: '20px' }}>X</button>
```

### ✅ Proper Touch Targets
```typescript
// GOOD: 48px minimum
<button style={{ 
  width: '48px', 
  height: '48px',
  padding: '12px' 
}}>✕</button>
```

### ❌ Ignoring Aspect Ratios
```typescript
// BAD: Fixed layout
<div style={{ width: '1920px', height: '1080px' }}>
```

### ✅ Responsive Layout
```typescript
// GOOD: Flexible layout
<div style={{ 
  width: '100vw', 
  height: '100vh',
  display: 'flex',
  flexDirection: window.innerHeight > window.innerWidth ? 'column' : 'row'
}}>
```

## Implementation Checklist

When implementing ANY feature:

1. **Design for touch FIRST**
   - How does this work with fingers?
   - What's the tap target?
   - Is it discoverable?

2. **Consider all orientations**
   - Portrait phone
   - Landscape phone
   - Tablet
   - Foldable

3. **Add keyboard as enhancement**
   - Keyboard shortcuts are optional
   - Document them separately
   - Don't show them in primary UI

4. **Test on mobile viewport**
   - Chrome DevTools mobile emulation
   - Test rotation
   - Test different screen sizes

5. **Optimize for mobile**
   - Performance budget
   - Battery impact
   - Network usage

## Remember

**Mobile users are your PRIMARY audience.** If it doesn't work well on a phone, it doesn't work. Period.

Every "Press X" is a failure. Every small button is a failure. Every keyboard-only feature is a failure.

Design for thumbs, not mice. Design for touch, not clicks. Design for mobile, not desktop.
