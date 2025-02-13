# Modern AI Tool Protocol Specification

## The Problem

Current AI tool protocols are severely limited, treating complex real-world interactions as simple string-based request/response pairs. This leads to:

- Poor error handling
- No native async support
- Limited documentation
- No versioning
- No state management
- String-based everything

## Proposed Solution

A robust, modern protocol that treats AI tools as first-class citizens:

```typescript
type ModernTool = {
  // Versioning & Lifecycle
  version: string,
  deprecatedAfter?: Date,
  
  // Rich Documentation
  documentation: {
    description: string,
    examples: Example[],
    limitations: string[],
    costImplications?: CostInfo
  },

  // Proper Error Handling
  errors: {
    possibleErrors: ErrorType[],
    retryStrategies: RetryStrategy[],
    fallbackBehavior?: FallbackStrategy
  },

  // Async Support
  execution: {
    estimatedDuration?: Duration,
    canBeCancelled: boolean,
    supportsProgress: boolean,
    parallelExecutionLimit?: number
  },

  // State Management
  state: {
    persistsBetweenCalls: boolean,
    requiredContext?: ContextType[],
    sideEffects?: SideEffect[]
  }
}

// Supporting Types
type Example = {
  input: unknown,
  output: unknown,
  description: string,
  tags?: string[]
}

type CostInfo = {
  estimatedCostPerCall: number,
  currency: string,
  billingModel: 'per-call' | 'per-data' | 'per-duration'
}

type ErrorType = {
  code: string,
  description: string,
  isRetryable: boolean,
  suggestedUserMessage: string
}

type RetryStrategy = {
  type: 'exponential-backoff' | 'fixed-interval' | 'custom',
  maxAttempts: number,
  initialDelay?: number
}

type Duration = {
  min: number,
  max: number,
  unit: 'ms' | 's' | 'm' | 'h'
}

type ContextType = {
  key: string,
  type: 'user' | 'system' | 'session',
  description: string
}

type SideEffect = {
  type: 'filesystem' | 'network' | 'database' | 'external-service',
  description: string,
  isReversible: boolean
}
```

## Key Features

### 1. Versioning & Lifecycle
- Explicit version tracking
- Deprecation scheduling
- Migration paths

### 2. Rich Documentation
- Detailed descriptions
- Real-world examples
- Known limitations
- Cost implications

### 3. Error Handling
- Typed error definitions
- Retry strategies
- Fallback behaviors
- User-friendly messages

### 4. Async Support
- Progress reporting
- Cancellation
- Parallel execution
- Duration estimates

### 5. State Management
- Context persistence
- Side effect tracking
- Required context

## Example Implementation

```typescript
const imageGenerationTool: ModernTool = {
  version: "1.0.0",
  deprecatedAfter: new Date("2025-12-31"),
  
  documentation: {
    description: "Generate images using stable diffusion",
    examples: [{
      input: { prompt: "A sunset over mountains" },
      output: { url: "https://..." },
      description: "Basic landscape generation"
    }],
    limitations: [
      "Maximum resolution: 1024x1024",
      "No explicit content"
    ],
    costImplications: {
      estimatedCostPerCall: 0.1,
      currency: "USD",
      billingModel: "per-call"
    }
  },

  errors: {
    possibleErrors: [{
      code: "NSFW_CONTENT",
      description: "Prompt contains inappropriate content",
      isRetryable: false,
      suggestedUserMessage: "Please modify prompt to exclude inappropriate content"
    }],
    retryStrategies: [{
      type: "exponential-backoff",
      maxAttempts: 3,
      initialDelay: 1000
    }]
  },

  execution: {
    estimatedDuration: {
      min: 10,
      max: 30,
      unit: 's'
    },
    canBeCancelled: true,
    supportsProgress: true,
    parallelExecutionLimit: 5
  },

  state: {
    persistsBetweenCalls: false,
    requiredContext: [{
      key: "user_preferences",
      type: "user",
      description: "User's style preferences"
    }],
    sideEffects: [{
      type: "filesystem",
      description: "Saves generated image to disk",
      isReversible: true
    }]
  }
}
```

## Benefits

1. **Better Error Handling**
   - Typed errors with clear messaging
   - Built-in retry mechanisms
   - Fallback behaviors

2. **Proper Async Support**
   - Progress reporting
   - Cancellation
   - Parallel execution

3. **Clear Documentation**
   - Examples
   - Limitations
   - Cost implications

4. **State Management**
   - Context tracking
   - Side effect awareness
   - Clear dependencies

5. **Version Control**
   - Explicit versioning
   - Deprecation notices
   - Migration paths

## Next Steps

1. Create reference implementation
2. Define standard error codes
3. Build tooling for validation
4. Create migration guides
5. Define standard retry strategies

## Contributing

This is a living document. Please submit issues and PRs to help improve this specification.
