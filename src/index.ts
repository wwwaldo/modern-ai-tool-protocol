// Core Protocol Types
export type ModernTool = {
  version: string;
  deprecatedAfter?: Date;
  
  documentation: Documentation;
  errors: ErrorConfig;
  execution: ExecutionConfig;
  state: StateConfig;
};

export type Documentation = {
  description: string;
  examples: Example[];
  limitations: string[];
  costImplications?: CostInfo;
};

export type Example = {
  input: unknown;
  output: unknown;
  description: string;
  tags?: string[];
};

export type CostInfo = {
  estimatedCostPerCall: number;
  currency: string;
  billingModel: 'per-call' | 'per-data' | 'per-duration';
};

export type ErrorConfig = {
  possibleErrors: ErrorType[];
  retryStrategies: RetryStrategy[];
  fallbackBehavior?: FallbackStrategy;
};

export type ErrorType = {
  code: string;
  description: string;
  isRetryable: boolean;
  suggestedUserMessage: string;
};

export type RetryStrategy = {
  type: 'exponential-backoff' | 'fixed-interval' | 'custom';
  maxAttempts: number;
  initialDelay?: number;
};

export type FallbackStrategy = {
  type: 'alternative-tool' | 'degraded-mode' | 'cache' | 'custom';
  description: string;
};

export type ExecutionConfig = {
  estimatedDuration?: Duration;
  canBeCancelled: boolean;
  supportsProgress: boolean;
  parallelExecutionLimit?: number;
};

export type Duration = {
  min: number;
  max: number;
  unit: 'ms' | 's' | 'm' | 'h';
};

export type StateConfig = {
  persistsBetweenCalls: boolean;
  requiredContext?: ContextType[];
  sideEffects?: SideEffect[];
};

export type ContextType = {
  key: string;
  type: 'user' | 'system' | 'session';
  description: string;
};

export type SideEffect = {
  type: 'filesystem' | 'network' | 'database' | 'external-service';
  description: string;
  isReversible: boolean;
};

// Tool Response Types
export type ToolResponse<T = unknown> = {
  status: 'success' | 'error' | 'pending';
  data?: T;
  error?: ToolError;
  progress?: ProgressInfo;
};

export type ToolError = {
  code: string;
  message: string;
  retryable: boolean;
  userMessage: string;
  details?: unknown;
};

export type ProgressInfo = {
  percentage: number;
  message?: string;
  eta?: number;
};

// Utility Types
export type ToolMetadata = {
  id: string;
  name: string;
  category?: string;
  tags?: string[];
  maintainer?: string;
};

// Helper Functions
export function createTool<TInput, TOutput>(
  config: ModernTool & {
    metadata: ToolMetadata;
    execute: (input: TInput) => Promise<ToolResponse<TOutput>>;
  }
) {
  return config;
}

// Example Usage
export const exampleTool = createTool({
  version: '1.0.0',
  metadata: {
    id: 'image-generator',
    name: 'Image Generator',
    category: 'media',
    tags: ['image', 'ai']
  },
  documentation: {
    description: 'Generate images using stable diffusion',
    examples: [{
      input: { prompt: 'A sunset over mountains' },
      output: { url: 'https://...' },
      description: 'Basic landscape generation'
    }],
    limitations: [
      'Maximum resolution: 1024x1024',
      'No explicit content'
    ]
  },
  errors: {
    possibleErrors: [{
      code: 'NSFW_CONTENT',
      description: 'Prompt contains inappropriate content',
      isRetryable: false,
      suggestedUserMessage: 'Please modify prompt to exclude inappropriate content'
    }],
    retryStrategies: [{
      type: 'exponential-backoff',
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
      key: 'user_preferences',
      type: 'user',
      description: "User's style preferences"
    }],
    sideEffects: [{
      type: 'filesystem',
      description: 'Saves generated image to disk',
      isReversible: true
    }]
  },
  async execute(input: { prompt: string }) {
    // Implementation here
    return {
      status: 'success',
      data: { url: 'https://...' }
    };
  }
});
