import { createTool, ModernTool, ToolResponse } from '../../src';

interface ImageGenInput {
  prompt: string;
  style?: string;
  size?: { width: number; height: number };
  negativePrompt?: string;
}

interface ImageGenOutput {
  url: string;
  metadata: {
    seed: number;
    generationParams: Record<string, unknown>;
    safetyChecks: { passed: boolean; flags: string[] };
  };
}

const imageGenerationTool = createTool<ImageGenInput, ImageGenOutput>({
  version: '1.0.0',
  metadata: {
    id: 'stable-diffusion-xl',
    name: 'SDXL Image Generator',
    category: 'media',
    tags: ['image', 'ai', 'stable-diffusion']
  },

  documentation: {
    description: 'Generate high-quality images using Stable Diffusion XL',
    examples: [
      {
        input: {
          prompt: 'A cyberpunk city at night with neon lights',
          style: 'realistic',
          size: { width: 1024, height: 1024 }
        },
        output: {
          url: 'https://...',
          metadata: {
            seed: 12345,
            generationParams: { steps: 30, cfg_scale: 7 },
            safetyChecks: { passed: true, flags: [] }
          }
        },
        description: 'Generating a complex cityscape',
        tags: ['landscape', 'complex', 'high-detail']
      }
    ],
    limitations: [
      'Maximum resolution: 1024x1024',
      'Rate limited to 50 images per minute',
      'No explicit content or violence',
      'Some art styles may not render correctly'
    ],
    costImplications: {
      estimatedCostPerCall: 0.1,
      currency: 'USD',
      billingModel: 'per-call'
    }
  },

  errors: {
    possibleErrors: [
      {
        code: 'NSFW_CONTENT',
        description: 'Prompt contains inappropriate content',
        isRetryable: false,
        suggestedUserMessage: 'Please modify the prompt to exclude inappropriate content'
      },
      {
        code: 'RATE_LIMIT',
        description: 'Too many requests',
        isRetryable: true,
        suggestedUserMessage: 'Generation queue is full, please try again in a few minutes'
      },
      {
        code: 'INVALID_SIZE',
        description: 'Requested image size not supported',
        isRetryable: false,
        suggestedUserMessage: 'Please choose a size up to 1024x1024'
      }
    ],
    retryStrategies: [
      {
        type: 'exponential-backoff',
        maxAttempts: 3,
        initialDelay: 1000
      }
    ],
    fallbackBehavior: {
      type: 'degraded-mode',
      description: 'Fall back to lower resolution or simpler model if main model is unavailable'
    }
  },

  execution: {
    estimatedDuration: {
      min: 5,
      max: 30,
      unit: 's'
    },
    canBeCancelled: true,
    supportsProgress: true,
    parallelExecutionLimit: 5
  },

  state: {
    persistsBetweenCalls: false,
    requiredContext: [
      {
        key: 'user_preferences',
        type: 'user',
        description: 'User style preferences and safety settings'
      },
      {
        key: 'api_key',
        type: 'system',
        description: 'API authentication token'
      }
    ],
    sideEffects: [
      {
        type: 'filesystem',
        description: 'Temporarily caches generated images',
        isReversible: true
      },
      {
        type: 'external-service',
        description: 'Calls Stable Diffusion API',
        isReversible: false
      }
    ]
  },

  async execute(input: ImageGenInput): Promise<ToolResponse<ImageGenOutput>> {
    // Simulate progress updates
    const updateProgress = (progress: number) => ({
      status: 'pending' as const,
      progress: {
        percentage: progress,
        message: `Generating image: ${progress}% complete`,
        eta: Math.floor((100 - progress) * 0.3) // Rough ETA in seconds
      }
    });

    // Simulate the generation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield updateProgress(25);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield updateProgress(50);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield updateProgress(75);
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful completion
    return {
      status: 'success',
      data: {
        url: 'https://example.com/generated-image.png',
        metadata: {
          seed: Math.floor(Math.random() * 1000000),
          generationParams: {
            prompt: input.prompt,
            style: input.style,
            steps: 30,
            cfg_scale: 7
          },
          safetyChecks: {
            passed: true,
            flags: []
          }
        }
      }
    };
  }
});
