import { createTool, ModernTool, ToolResponse } from '../../src';

interface TranscriptionInput {
  videoUrl: string;
  targetLanguage?: string;
  includeTimestamps?: boolean;
  model?: 'fast' | 'accurate';
}

interface TranscriptionOutput {
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
  metadata: {
    duration: number;
    wordCount: number;
    confidence: number;
    modelUsed: string;
  };
}

const videoTranscriptionTool = createTool<TranscriptionInput, TranscriptionOutput>({
  version: '1.0.0',
  metadata: {
    id: 'whisper-transcription',
    name: 'Video Transcription',
    category: 'media',
    tags: ['video', 'audio', 'transcription', 'whisper']
  },

  documentation: {
    description: 'Transcribe video/audio content using OpenAI Whisper',
    examples: [
      {
        input: {
          videoUrl: 'https://example.com/video.mp4',
          targetLanguage: 'en',
          includeTimestamps: true,
          model: 'accurate'
        },
        output: {
          text: 'Hello, welcome to...',
          segments: [
            {
              start: 0,
              end: 2.5,
              text: 'Hello,',
              confidence: 0.98
            }
          ],
          metadata: {
            duration: 120,
            wordCount: 200,
            confidence: 0.95,
            modelUsed: 'whisper-large-v3'
          }
        },
        description: 'Basic video transcription with timestamps',
        tags: ['basic', 'english']
      }
    ],
    limitations: [
      'Maximum video length: 4 hours',
      'Maximum file size: 2GB',
      'Some accents may reduce accuracy',
      'Background noise can affect quality'
    ],
    costImplications: {
      estimatedCostPerCall: 0.002,
      currency: 'USD',
      billingModel: 'per-minute'
    }
  },

  errors: {
    possibleErrors: [
      {
        code: 'DOWNLOAD_ERROR',
        description: 'Could not download video',
        isRetryable: true,
        suggestedUserMessage: 'Video download failed. Please check the URL or try again.'
      },
      {
        code: 'UNSUPPORTED_FORMAT',
        description: 'Video format not supported',
        isRetryable: false,
        suggestedUserMessage: 'This video format is not supported. Please convert to MP4.'
      },
      {
        code: 'TOO_LONG',
        description: 'Video exceeds maximum duration',
        isRetryable: false,
        suggestedUserMessage: 'Video is too long. Maximum duration is 4 hours.'
      },
      {
        code: 'LOW_AUDIO_QUALITY',
        description: 'Audio quality too poor for accurate transcription',
        isRetryable: false,
        suggestedUserMessage: 'Audio quality is too low for accurate transcription.'
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
      description: 'Fall back to fast model if accurate model fails'
    }
  },

  execution: {
    estimatedDuration: {
      min: 30,
      max: 300,
      unit: 's'
    },
    canBeCancelled: true,
    supportsProgress: true,
    parallelExecutionLimit: 2
  },

  state: {
    persistsBetweenCalls: true,
    requiredContext: [
      {
        key: 'api_key',
        type: 'system',
        description: 'Whisper API authentication token'
      },
      {
        key: 'download_path',
        type: 'system',
        description: 'Temporary storage location'
      }
    ],
    sideEffects: [
      {
        type: 'filesystem',
        description: 'Downloads video to temp storage',
        isReversible: true
      },
      {
        type: 'external-service',
        description: 'Calls Whisper API',
        isReversible: false
      }
    ]
  },

  async* execute(input: TranscriptionInput): AsyncGenerator<ToolResponse<TranscriptionOutput>> {
    try {
      // Step 1: Download video
      yield {
        status: 'pending',
        progress: {
          percentage: 10,
          message: 'Downloading video...',
          eta: 30
        }
      };

      // Simulate download
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Extract audio
      yield {
        status: 'pending',
        progress: {
          percentage: 30,
          message: 'Extracting audio...',
          eta: 25
        }
      };

      // Simulate extraction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Transcribe
      yield {
        status: 'pending',
        progress: {
          percentage: 50,
          message: 'Transcribing...',
          eta: 20
        }
      };

      // Simulate transcription
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 4: Post-process
      yield {
        status: 'pending',
        progress: {
          percentage: 80,
          message: 'Post-processing transcription...',
          eta: 5
        }
      };

      // Simulate post-processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Return success
      return {
        status: 'success',
        data: {
          text: 'This is a simulated transcription of the video content...',
          segments: [
            {
              start: 0,
              end: 2.5,
              text: 'This is',
              confidence: 0.98
            },
            {
              start: 2.5,
              end: 5.0,
              text: 'a simulated transcription',
              confidence: 0.95
            }
          ],
          metadata: {
            duration: 120,
            wordCount: 200,
            confidence: 0.96,
            modelUsed: input.model === 'accurate' ? 'whisper-large-v3' : 'whisper-base'
          }
        }
      };
    } catch (error: any) {
      // Handle errors with proper typing
      return {
        status: 'error',
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message,
          retryable: error.code === 'DOWNLOAD_ERROR',
          userMessage: 'Failed to transcribe video. Please try again.'
        }
      };
    }
  }
});
