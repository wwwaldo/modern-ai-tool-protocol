# Rate Limiting in Modern AI Tool Protocol

## Important Note ⚠️

Event queuing and priority systems are a footgun - they add complexity and can lead to race conditions, lost events, and hard-to-debug issues.

## Current Recommendation

Keep it simple:
```typescript
// Simple rate limiting for cursor events
const RATE_LIMIT_MS = 1000; // 1 event per second
let lastEventTime = 0;

function emitCursorEvent(event: CursorEvent) {
  const now = Date.now();
  if (now - lastEventTime < RATE_LIMIT_MS) {
    return; // Drop the event
  }
  lastEventTime = now;
  eventBus.emit('cursor.move', event);
}
```

This gives us:
- Predictable behavior
- No complex queuing
- No priority system to debug
- Still enough context for the AI

We can revisit more complex solutions once we have real-world usage data.
