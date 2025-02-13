# User Events Layer

## Core Events

```typescript
type UserEvent = {
  id: string;
  timestamp: number;
  source: 'user' | 'system' | 'tool';
  type: UserEventType;
  payload: unknown;
  metadata?: Record<string, unknown>;
};

type UserEventType =
  // Tool Interaction Events
  | 'tool.start'
  | 'tool.complete'
  | 'tool.error'
  | 'tool.cancel'
  | 'tool.progress'
  | 'tool.stream.chunk'
  
  // User Interaction Events
  | 'user.input'
  | 'user.confirm'
  | 'user.reject'
  | 'user.cancel'
  | 'user.preference.update'
  
  // UI Events
  | 'ui.view.change'
  | 'ui.modal.open'
  | 'ui.modal.close'
  | 'ui.notification.show'
  
  // System Events
  | 'system.ready'
  | 'system.error'
  | 'system.resource.low'
  | 'system.update.available';

// Event Bus for type-safe pub/sub
interface EventBus {
  emit<T extends UserEventType>(
    type: T,
    payload: EventPayloadMap[T]
  ): void;

  on<T extends UserEventType>(
    type: T,
    handler: (event: UserEvent & { payload: EventPayloadMap[T] }) => void
  ): () => void;

  once<T extends UserEventType>(
    type: T,
    handler: (event: UserEvent & { payload: EventPayloadMap[T] }) => void
  ): () => void;
}

// Type-safe event payloads
interface EventPayloadMap {
  'tool.start': {
    toolId: string;
    input: unknown;
    expectedDuration?: number;
  };
  
  'tool.complete': {
    toolId: string;
    result: unknown;
    duration: number;
    cost?: number;
  };
  
  'tool.error': {
    toolId: string;
    error: ToolError;
    canRetry: boolean;
    suggestedAction?: string;
  };

  'tool.progress': {
    toolId: string;
    progress: number;
    message?: string;
    eta?: number;
  };

  'user.input': {
    inputType: 'text' | 'file' | 'selection';
    value: unknown;
    context?: string;
  };

  'user.preference.update': {
    key: string;
    value: unknown;
    scope: 'global' | 'tool' | 'session';
  };

  // ... other event payloads
}

// TODO: Event Queue Handling (v0.2.0)
// The protocol will explicitly define:
// 1. Maximum queue size limits
// 2. Event dropping behavior (FIFO)
// 3. Optional event priorities
// 4. Back-pressure mechanisms
//
// For now, implementations should handle queue limits 
// based on their specific needs.

## Usage Example

```typescript
class ToolExecutor {
  constructor(private events: EventBus) {}

  async executeTool<TInput, TOutput>(
    tool: ModernTool,
    input: TInput
  ): Promise<TOutput> {
    // Emit start event
    this.events.emit('tool.start', {
      toolId: tool.id,
      input,
      expectedDuration: tool.execution.estimatedDuration?.max
    });

    try {
      // Handle progress updates
      tool.on('progress', (progress) => {
        this.events.emit('tool.progress', {
          toolId: tool.id,
          progress: progress.percentage,
          message: progress.message,
          eta: progress.eta
        });
      });

      const result = await tool.execute(input);

      // Emit completion
      this.events.emit('tool.complete', {
        toolId: tool.id,
        result,
        duration: performance.now() - startTime,
        cost: tool.documentation.costImplications?.estimatedCostPerCall
      });

      return result;
    } catch (error) {
      // Emit error
      this.events.emit('tool.error', {
        toolId: tool.id,
        error,
        canRetry: error.isRetryable,
        suggestedAction: error.suggestedUserMessage
      });
      throw error;
    }
  }
}
```

## UI Integration Example

```typescript
class ToolUI {
  constructor(private events: EventBus) {
    // Show progress bar for long-running tools
    events.on('tool.start', (event) => {
      if (event.payload.expectedDuration > 1000) {
        this.showProgressBar();
      }
    });

    // Update progress
    events.on('tool.progress', (event) => {
      this.updateProgress(event.payload.progress, event.payload.message);
    });

    // Show errors in UI
    events.on('tool.error', (event) => {
      this.showError(event.payload.error.userMessage);
      if (event.payload.canRetry) {
        this.showRetryButton();
      }
    });

    // Handle user preferences
    events.on('user.preference.update', (event) => {
      if (event.payload.scope === 'ui') {
        this.updateUIPreference(event.payload.key, event.payload.value);
      }
    });
  }
}
```

## Benefits

1. **Type Safety**
   - Full TypeScript support
   - Compile-time event payload validation
   - Auto-completion for event types and payloads

2. **Debugging**
   - Consistent event structure
   - Built-in timestamps and metadata
   - Easy to add logging/monitoring

3. **UI Integration**
   - Decoupled tool execution from UI
   - Consistent progress reporting
   - Standardized error handling

4. **User Experience**
   - Real-time progress updates
   - Consistent error messages
   - Preference persistence

5. **Extensibility**
   - Easy to add new event types
   - Plugin system support
   - Analytics integration

## Analytics Integration

```typescript
class ToolAnalytics {
  constructor(private events: EventBus) {
    // Track tool usage
    events.on('tool.start', this.trackToolStart);
    events.on('tool.complete', this.trackToolComplete);
    events.on('tool.error', this.trackToolError);

    // Track user interactions
    events.on('user.input', this.trackUserInput);
    events.on('user.preference.update', this.trackPreferenceUpdate);
  }

  private trackToolStart(event: UserEvent) {
    analytics.track('Tool Started', {
      toolId: event.payload.toolId,
      timestamp: event.timestamp,
      expectedDuration: event.payload.expectedDuration
    });
  }

  // ... other tracking methods
}
```

## Open Questions

1. Should we support event replay for debugging?
2. How do we handle event versioning?
3. Should events be persisted? If so, where?
4. How do we handle event ordering in distributed systems?
5. Should we add event schemas for validation?
