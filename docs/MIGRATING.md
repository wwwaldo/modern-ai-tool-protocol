# Migrating from Existing Tool Protocols

This guide helps you migrate from existing AI tool protocols (OpenAI, Anthropic) to the Modern AI Tool Protocol.

## OpenAI Function Calling → Modern Protocol

### Before (OpenAI)
```typescript
const weatherTool = {
  type: "function",
  function: {
    name: "get_weather",
    description: "Get the weather in a location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city and state"
        }
      },
      required: ["location"]
    }
  }
};

// Usage
try {
  const result = await getWeather(args);
  return JSON.stringify(result);
} catch (error) {
  return JSON.stringify({ error: error.message });
}
```

### After (Modern Protocol)
```typescript
const weatherTool = createTool<WeatherInput, WeatherOutput>({
  version: "1.0.0",
  metadata: {
    id: "weather-service",
    name: "Weather Service"
  },
  
  documentation: {
    description: "Get detailed weather information for a location",
    examples: [{
      input: { location: "San Francisco, CA" },
      output: { temperature: 72, condition: "sunny" },
      description: "Basic weather lookup"
    }],
    limitations: [
      "Some remote locations may not have data",
      "Updates every 15 minutes"
    ]
  },

  errors: {
    possibleErrors: [{
      code: "LOCATION_NOT_FOUND",
      description: "Location not in database",
      isRetryable: false,
      suggestedUserMessage: "Please check the location name"
    }],
    retryStrategies: [{
      type: "exponential-backoff",
      maxAttempts: 3
    }]
  },

  execution: {
    estimatedDuration: { min: 1, max: 3, unit: "s" },
    canBeCancelled: true,
    supportsProgress: true
  },

  state: {
    persistsBetweenCalls: false,
    sideEffects: [{
      type: "external-service",
      description: "Calls weather API",
      isReversible: false
    }]
  },

  async execute(input) {
    try {
      const result = await getWeather(input.location);
      return {
        status: "success",
        data: result
      };
    } catch (error) {
      return {
        status: "error",
        error: {
          code: "LOCATION_NOT_FOUND",
          message: error.message,
          retryable: false,
          userMessage: "Location not found. Please check the spelling."
        }
      };
    }
  }
});
```

## Key Differences

### 1. Error Handling
- **Before**: Errors are just strings
- **After**: Structured error types, retry strategies, user messages

### 2. Documentation
- **Before**: Single description string
- **After**: Full documentation with examples, limitations, costs

### 3. State Management
- **Before**: No state management
- **After**: Explicit state tracking, side effects, required context

### 4. Async Support
- **Before**: No async patterns
- **After**: Progress updates, cancellation, parallel execution

### 5. Type Safety
- **Before**: Stringly-typed everything
- **After**: Full TypeScript support, type-safe inputs/outputs

## Migration Steps

1. **Identify Tools**
   - List all your current tools
   - Document their current behavior
   - Note any common patterns

2. **Add Metadata**
   ```typescript
   // Before
   name: "my_tool"
   
   // After
   metadata: {
     id: "my-tool",
     name: "My Tool",
     category: "utils"
   }
   ```

3. **Enhance Documentation**
   ```typescript
   // Before
   description: "Does something"
   
   // After
   documentation: {
     description: "Detailed description",
     examples: [...],
     limitations: [...],
     costImplications: {...}
   }
   ```

4. **Implement Error Handling**
   ```typescript
   // Before
   catch (e) { return { error: e.message }; }
   
   // After
   errors: {
     possibleErrors: [...],
     retryStrategies: [...],
     fallbackBehavior: {...}
   }
   ```

5. **Add State Management**
   ```typescript
   // Before
   // No state management
   
   // After
   state: {
     persistsBetweenCalls: true,
     requiredContext: [...],
     sideEffects: [...]
   }
   ```

6. **Implement Async Patterns**
   ```typescript
   // Before
   async function execute() { ... }
   
   // After
   async function* execute() {
     yield { progress: 50 };
     // ... 
   }
   ```

## Common Pitfalls

1. **Don't Just Wrap Old Tools**
   - Really think about error cases
   - Document limitations
   - Consider state implications

2. **Watch for Silent Failures**
   - Old tools might swallow errors
   - Add proper error types
   - Implement retry logic

3. **State is Important**
   - Document side effects
   - Track required context
   - Consider persistence

4. **Think About Async**
   - Add progress reporting
   - Implement cancellation
   - Consider parallel execution

## Testing Migration

1. **Functionality**
   ```typescript
   // Test basic operation
   const result = await tool.execute(input);
   expect(result.status).toBe("success");
   ```

2. **Error Handling**
   ```typescript
   // Test error cases
   const result = await tool.execute(badInput);
   expect(result.status).toBe("error");
   expect(result.error.code).toBe("EXPECTED_ERROR");
   ```

3. **Async Behavior**
   ```typescript
   // Test progress updates
   const updates = [];
   for await (const update of tool.execute(input)) {
     updates.push(update);
   }
   expect(updates).toContainProgress();
   ```

## Need Help?

- Check our [examples](../examples)
- Join our Discord
- Open an issue
- Read the full [specification](./PROTOCOL.md)
