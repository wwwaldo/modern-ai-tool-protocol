# Event Synchronization

## Event Structure
Each event includes:
```typescript
{
  sequence: number;     // Monotonically increasing sequence number
  sessionId: string;    // Unique for each client connection
  timestamp: number;    // When the event occurred
}
```

## Bidirectional Sync
The client and model maintain sync using a simple acknowledgment system:

1. Client sends events with sequence numbers:
```typescript
// Client -> Model
{
  type: 'cursor.move',
  sequence: 45,
  sessionId: 'abc123',
  data: { file: 'foo.ts', line: 10 }
}
```

2. Model acknowledges processed events:
```typescript
// Model -> Client
{
  ack: 45,  // "I've processed everything up through sequence 45"
  sessionId: 'abc123'
}
```

3. Client can detect sync issues:
```typescript
if (model.lastAck < client.lastSent - MAX_UNACKED_EVENTS) {
  // Too many unacknowledged events, possible sync issues
  // Options:
  // 1. Resend missed events
  // 2. Send current state snapshot
  // 3. Start new session
}
```

## Recovery Strategies
1. Small Gap (few events missed):
   - Resend missed events from client's event log
   
2. Large Gap (many events missed):
   - Send current state snapshot
   - Start new session with fresh sequence numbers

3. Session Change:
   - Always start with fresh sequence numbers
   - Send initial state snapshot

Think TCP, but way simpler! 🚀
