# Frame Protocol v1

Core protocol for agent-driven web interactions.

## Concepts

### Frames
```typescript
interface Frame {
  sequence: number
  url: string
  changes: {
    type: 'full_page' | 'diff' | 'error'
    content: string    // Full HTML or just changed content
    selector?: string  // For diffs: where the change occurred
    baseFrame?: number // For diffs: sequence number of full page to reference
    error?: {
      code: 'sequence_invalid' | 'element_not_found' | 'network_error'
      message: string
    }
  }
}

// Simple example:
const newPage = {
  sequence: 1,
  url: '/products',
  changes: {
    type: 'full_page',
    content: '<html>...</html>'
  }
}

const menuClick = {
  sequence: 2,
  url: '/products',
  changes: {
    type: 'diff',
    selector: '#menu-1',
    content: '<div>Menu items...</div>',
    baseFrame: 1
  }
}

// Error example:
const errorFrame = {
  sequence: 3,
  url: '/products',
  changes: {
    type: 'error',
    content: '<current page state>',
    error: {
      code: 'element_not_found',
      message: 'Could not find element #buy-button'
    }
  }
}

// Extended example showing base frame references:
const sequence = [
  {
    sequence: 1, 
    url: '/search', 
    changes: {
      type: 'full_page',
      content: '<search page>'
    }
  },
  {
    sequence: 2, 
    url: '/products', 
    changes: {
      type: 'full_page',
      content: '<product page>'
    }
  },
  {
    sequence: 3, 
    url: '/products', 
    changes: {
      type: 'diff',
      selector: '#menu-1',
      content: '<expanded menu>',
      baseFrame: 2  
    }
  },
  {
    sequence: 4, 
    url: '/products', 
    changes: {
      type: 'diff',
      selector: '#reviews',
      content: '<new review>',
      baseFrame: 2  
    }
  },
  {
    sequence: 5, 
    url: '/cart', 
    changes: {
      type: 'full_page',
      content: '<cart page>'
    }
  }
]

// Rule: baseFrame should point to most recent frame where:
// 1. url matches current frame
// 2. type is 'full_page'
```

### Actions
```typescript
// Read current state
interface Query {
  type: 'query'
  basedOnSequence: number
}

// Change state
interface Mutation {
  type: 'mutation'
  action: 'navigate' | 'click'
  basedOnSequence: number
  // Details depend on action type
}
```

## Flow

1. Agent initiates action (query or mutation)
2. Client validates frame sequence
3. For mutations: new frame is created
   - New URL -> full page
   - DOM change -> diff + reference to base frame
   - Error -> error frame with current state
4. Agent continues until task complete or error limit reached

## Tool Execution Modes

The Frame Protocol supports two modes of tool execution:

### Sequential (Default)
- Required for mutation tools that change state (e.g., `clickElement`)
- Each tool call gets a new sequence number
- Tools execute one after another
- Guarantees state consistency

### Parallel
- Available for query tools that don't change state (e.g., `getClickableElements`)
- Multiple tools can share the same sequence number
- Tools can execute concurrently
- More efficient for bulk operations

Example:
```typescript
// ❌ Mutations must be sequential
await clickElement({ selector: '#button1', sequence: 1 });
await clickElement({ selector: '#button2', sequence: 2 });

// ✅ Queries can be parallel
const [buttons, links] = await Promise.all([
  getClickableElements({ type: 'button', sequence: 3 }),
  getClickableElements({ type: 'link', sequence: 3 })
]);
```

## Error Handling

Even with tools that only expose valid actions, errors can occur due to:
1. Race conditions (page changed between query and action)
2. Network/server issues
3. Sequence validation failures
4. Unexpected DOM changes

Error frames let the agent:
1. Know exactly what went wrong
2. Try alternative approaches
3. Fall back to safer actions
4. Know when to give up

## Getting Started

Here's a real-world example using a web scraping tool:

```typescript
// 1. Define your tool
const getProductPrices: ToolDefinition = {
  name: 'getProductPrices',
  type: 'query',  // Can run in parallel with other queries
  description: 'Get prices for a product across different stores',
  input: {
    productName: 'string',
    maxResults: 'number'
  },
  execute: async (input) => {
    // Your implementation here
    return { prices: [...] };
  }
}

// 2. Use the tool (Model's perspective)
// First query - can run in parallel
{
  sequence: 1,
  reason: "Checking Amazon prices for organic eggs",
  type: 'query',
  content: await getProductPrices({ 
    productName: 'organic eggs',
    store: 'amazon'
  })
}

// Second query - same sequence since it's parallel
{
  sequence: 1,
  reason: "Also checking Walmart prices to compare",
  type: 'query',
  content: await getProductPrices({ 
    productName: 'organic eggs',
    store: 'walmart'
  })
}

// Mutation - must increment sequence
{
  sequence: 2,
  reason: "Adding best-priced eggs to cart",
  type: 'mutation',
  content: await addToCart({
    productId: 'xyz',
    quantity: 1
  })
}
```

Key Points:
1. Mark tools as `query` (parallel) or `mutation` (sequential)
2. Include `reason` to explain your thinking
3. Keep same sequence for parallel queries
4. Increment sequence for mutations
5. Return results in `content`

That's it! The protocol handles the rest.

## Subprotocols

The Frame Protocol consists of two distinct subprotocols:

### 1. Tool Protocol (Client ↔ Model)

Handles the actual tool execution and state management:

```typescript
interface ToolFrame {
  sequence: number;    // For state validation
  type: 'full' | 'diff' | 'error';  // Type of state change
  content: string;     // Tool-specific data
  status: 'success' | 'error';
}
```

### 2. Thought Protocol (Model → Human)

Explains the model's reasoning to humans:

```typescript
interface ThoughtFrame {
  sequence: number;    // Matches corresponding tool sequence
  thought: string;     // e.g. "Looking up product prices..."
  status: 'in_progress' | 'success' | 'error';
}
```

### Usage Rules

1. Every tool invocation MUST be wrapped in a thought frame
2. Thought frames MUST precede their corresponding tool frames
3. Sequence numbers MUST match between thought and tool frames
4. Parallel queries share the same sequence number in both protocols
5. Mutations increment the sequence in both protocols

This ensures that:
- Tools handle state management
- Models explain their reasoning
- Humans can follow the process
- State validation works across both protocols

That's it. Everything else comes later.
