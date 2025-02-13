# Frame-Based Navigation Protocol

This protocol is an implementation built on top of the general events protocol. It uses the same event bus and base protocol structure, but adds specific payload shapes and resolution rules for handling web navigation state and AI actions.

Version 1 focuses on Claude-driven navigation only. User-driven events will be added in a future version.

## Core Concepts

### Frames
- Each navigation action creates a new frame
- Frames have monotonically increasing sequence numbers
- Frames capture the state at a point in time

```typescript
interface Frame {
  sequence: number
  url: string
  action: 'navigate' | 'click'
  source: 'claude'  // v1: only Claude-driven
  fullPage?: string  // Included when URL changes
}
```

## Protocol Flow

1. Claude's Actions
```typescript
// Single action
response = {
  action: {
    type: 'navigate',
    url: '/product/123',
    basedOnSequence: 3
  }
}

// Multiple actions in sequence
response = {
  actions: [
    {
      type: 'navigate',
      url: '/search',
      basedOnSequence: 3
    },
    {
      type: 'click',
      element: '#result2',
      basedOnSequence: 4  // Based on frame after navigation
    }
  ]
}
```

2. Client Side Resolution
```typescript
// For single action
if (isFrameStillValid(action.basedOnSequence)) {
  executeAction(action)
}

// For action sequence
for (const action of actions) {
  if (!isFrameStillValid(action.basedOnSequence)) {
    break // Stop if any action's frame is invalid
  }
  executeAction(action)
}
```

## Key Features

1. Sequence Validation
   - Actions are only executed if they're based on current state
   - Prevents actions on stale/outdated pages

2. Action Sequences
   - Claude can plan multiple actions
   - Each action specifies its required frame
   - Sequence stops if any frame becomes invalid

3. State Management
   - Full page content sent on URL changes
   - Simple heuristic for when Claude needs full context

## Example Flow

```typescript
// Claude plans a search->click sequence
response = {
  actions: [
    {
      type: 'navigate',
      url: '/search?q=products',
      basedOnSequence: 1
    },
    {
      type: 'click',
      element: '#result3',
      basedOnSequence: 2
    }
  ]
}

// Client executes each action if frames are valid
```

## TODOs for Future Versions
- [ ] Add user-driven event handling
- [ ] Add user-Claude interaction patterns
- [ ] Add client-side event buffering
- [ ] Add reconnection handling
