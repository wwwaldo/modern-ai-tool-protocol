# Modern AI Tool Protocol

A proposal for a robust, production-ready protocol for AI tool interactions.

## The Problem

Current AI tool protocols (OpenAI, Anthropic, etc.) are too simplistic for real-world applications, treating complex operations as simple string-based request/response pairs. We need something better.

## Quick Start

```typescript
// Current AI Tool Protocols
type CurrentTool = {
  name: string,
  description: string,
  parameters: JSONSchema
}

// Our Proposed Protocol
type ModernTool = {
  version: string,
  documentation: { ... },
  errors: { ... },
  execution: { ... },
  state: { ... }
}
```

## Key Features

- ✨ Rich Documentation
- 🚀 Native Async Support
- 💪 Proper Error Handling
- 📦 State Management
- 🔄 Version Control

## Documentation

- [Full Protocol Specification](./docs/PROTOCOL.md)
- [Migration Guide](./docs/MIGRATING.md)
- [Comparison with Other Protocols](./docs/COMPARISON.md)

## Real-World Examples

### 1. Image Generation
```typescript
const imageGen = createTool<ImageInput, ImageOutput>({
  version: "1.0.0",
  documentation: { ... },
  errors: {
    possibleErrors: [{
      code: "NSFW_CONTENT",
      isRetryable: false
    }]
  },
  execution: {
    supportsProgress: true,
    canBeCancelled: true
  }
});
```
[Full Example](./examples/real-world/image-generation.ts)

### 2. Video Transcription
```typescript
const transcriber = createTool<TranscriptionInput, TranscriptionOutput>({
  version: "1.0.0",
  execution: {
    estimatedDuration: { min: 30, max: 300, unit: "s" },
    supportsProgress: true
  },
  state: {
    persistsBetweenCalls: true,
    sideEffects: [{
      type: "filesystem",
      isReversible: true
    }]
  }
});
```
[Full Example](./examples/real-world/video-transcription.ts)

## Why This Matters

Current AI tool protocols are holding back real-world AI applications. We need:

1. **Better Error Handling**
   - Typed errors with retry strategies
   - User-friendly messages
   - Fallback behaviors

2. **Proper Async Support**
   - Progress reporting
   - Cancellation
   - Parallel execution
   - ETA estimates

3. **State Management**
   - Context persistence
   - Side effect tracking
   - Required dependencies

4. **Rich Documentation**
   - Examples with context
   - Known limitations
   - Cost implications
   - Version information

5. **Type Safety**
   - Full TypeScript support
   - Compile-time checking
   - Better developer experience

## Comparison with Existing Protocols

| Feature | Modern Protocol | OpenAI | Anthropic |
|---------|----------------|---------|-----------|
| Type Safety | ✅ | ❌ | ❌ |
| Error Handling | ✅ | ❌ | ❌ |
| Async Support | ✅ | ❌ | ❌ |
| State Management | ✅ | ❌ | ❌ |
| Documentation | ✅ | ❌ | ❌ |

[Full Comparison](./docs/COMPARISON.md)

## Getting Started

1. **Install**
   ```bash
   npm install modern-ai-tool-protocol
   ```

2. **Create a Tool**
   ```typescript
   import { createTool } from 'modern-ai-tool-protocol';

   const myTool = createTool({
     version: "1.0.0",
     // ... configuration
   });
   ```

3. **Use with AI**
   ```typescript
   const result = await myTool.execute(input);
   ```

## Contributing

This is a community effort to improve AI tool interactions. We welcome:

- 💡 Feature proposals
- 📝 Documentation improvements
- 🐛 Bug reports
- 🤝 Implementation examples

## Next Steps

1. Reference Implementation
   - [ ] Core protocol library
   - [ ] Testing utilities
   - [ ] Example integrations

2. Tooling
   - [ ] TypeScript types
   - [ ] Validation helpers
   - [ ] Migration tools

3. Documentation
   - [ ] Best practices
   - [ ] Performance tips
   - [ ] Security guidelines

## License

MIT
