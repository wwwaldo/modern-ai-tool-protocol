import { createTool, ModernTool, ToolResponse } from '../../src';

interface TrainingInput {
  dataset: {
    trainPath: string;
    validationPath?: string;
    format: 'csv' | 'parquet' | 'json';
  };
  model: {
    architecture: string;
    hyperparameters: Record<string, unknown>;
    checkpointPath?: string;
  };
  training: {
    epochs: number;
    batchSize: number;
    earlyStoppingPatience?: number;
    distributedTraining?: boolean;
  };
}

interface TrainingOutput {
  model: {
    path: string;
    metrics: {
      trainLoss: number;
      validationLoss: number;
      accuracy: number;
    };
    hyperparameters: Record<string, unknown>;
  };
  training: {
    duration: number;
    epochsCompleted: number;
    learningCurve: Array<{
      epoch: number;
      metrics: Record<string, number>;
    }>;
  };
  resources: {
    gpuHoursUsed: number;
    peakMemoryUsage: number;
    costEstimate: number;
  };
}

interface TrainingMetrics {
  currentEpoch: number;
  batchesCompleted: number;
  metrics: Record<string, number>;
  resourceUsage: {
    gpuUtilization: number;
    memoryUsage: number;
  };
}

const mlTrainingTool = createTool<TrainingInput, TrainingOutput>({
  version: '1.0.0',
  metadata: {
    id: 'ml-training',
    name: 'ML Model Training',
    category: 'machine-learning',
    tags: ['ml', 'training', 'gpu', 'distributed']
  },

  documentation: {
    description: 'Train machine learning models with distributed computing support',
    examples: [
      {
        input: {
          dataset: {
            trainPath: 's3://my-bucket/train.parquet',
            validationPath: 's3://my-bucket/valid.parquet',
            format: 'parquet'
          },
          model: {
            architecture: 'resnet50',
            hyperparameters: {
              learningRate: 0.001,
              optimizer: 'adam'
            }
          },
          training: {
            epochs: 10,
            batchSize: 32,
            distributedTraining: true
          }
        },
        output: {
          model: {
            path: 's3://my-bucket/models/resnet50-v1.pt',
            metrics: {
              trainLoss: 0.123,
              validationLoss: 0.145,
              accuracy: 0.95
            },
            hyperparameters: {
              finalLearningRate: 0.0001
            }
          },
          training: {
            duration: 3600,
            epochsCompleted: 10,
            learningCurve: [
              {
                epoch: 1,
                metrics: { loss: 0.5, accuracy: 0.85 }
              }
            ]
          },
          resources: {
            gpuHoursUsed: 4,
            peakMemoryUsage: 16000000000,
            costEstimate: 12.50
          }
        },
        description: 'Distributed training of ResNet50 on image dataset',
        tags: ['distributed', 'vision', 'resnet']
      }
    ],
    limitations: [
      'Maximum dataset size: 1TB',
      'Maximum training time: 24 hours',
      'GPU types: V100, A100 only',
      'Distributed training requires special setup'
    ],
    costImplications: {
      estimatedCostPerCall: 10,
      currency: 'USD',
      billingModel: 'per-duration'
    }
  },

  errors: {
    possibleErrors: [
      {
        code: 'DATASET_NOT_FOUND',
        description: 'Dataset path is invalid or inaccessible',
        isRetryable: false,
        suggestedUserMessage: 'Please check dataset path and permissions'
      },
      {
        code: 'GPU_UNAVAILABLE',
        description: 'No GPUs available for training',
        isRetryable: true,
        suggestedUserMessage: 'All GPUs are currently in use. Please try again later.'
      },
      {
        code: 'OUT_OF_MEMORY',
        description: 'Model too large for available GPU memory',
        isRetryable: false,
        suggestedUserMessage: 'Please reduce batch size or model size'
      },
      {
        code: 'TRAINING_DIVERGED',
        description: 'Training has diverged (NaN loss)',
        isRetryable: false,
        suggestedUserMessage: 'Training failed due to numerical instability. Try adjusting learning rate.'
      }
    ],
    retryStrategies: [
      {
        type: 'exponential-backoff',
        maxAttempts: 5,
        initialDelay: 60000 // 1 minute
      }
    ],
    fallbackBehavior: {
      type: 'degraded-mode',
      description: 'Fall back to single-GPU training if distributed fails'
    }
  },

  execution: {
    estimatedDuration: {
      min: 1800,
      max: 86400,
      unit: 's'
    },
    canBeCancelled: true,
    supportsProgress: true,
    parallelExecutionLimit: 1
  },

  state: {
    persistsBetweenCalls: true,
    requiredContext: [
      {
        key: 'gpu_config',
        type: 'system',
        description: 'GPU configuration and availability'
      },
      {
        key: 'cloud_credentials',
        type: 'system',
        description: 'Cloud storage access credentials'
      },
      {
        key: 'distributed_config',
        type: 'system',
        description: 'Distributed training configuration'
      }
    ],
    sideEffects: [
      {
        type: 'filesystem',
        description: 'Saves model checkpoints',
        isReversible: true
      },
      {
        type: 'external-service',
        description: 'Uses GPU resources',
        isReversible: false
      },
      {
        type: 'database',
        description: 'Logs metrics to experiment tracker',
        isReversible: true
      }
    ]
  },

  async* execute(input: TrainingInput): AsyncGenerator<ToolResponse<TrainingOutput | TrainingMetrics>> {
    try {
      // Step 1: Setup and validation
      yield {
        status: 'pending',
        progress: {
          percentage: 5,
          message: 'Setting up training environment...',
          eta: 30
        }
      };

      // Simulate environment setup
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 2: Data loading
      yield {
        status: 'pending',
        progress: {
          percentage: 10,
          message: 'Loading and validating dataset...',
          eta: 120
        }
      };

      // Simulate data loading
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Training loop
      const totalEpochs = input.training.epochs;
      for (let epoch = 1; epoch <= totalEpochs; epoch++) {
        // Simulate epoch training
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Yield detailed metrics
        yield {
          status: 'pending',
          data: {
            currentEpoch: epoch,
            batchesCompleted: 100,
            metrics: {
              loss: 0.5 - (0.3 * (epoch / totalEpochs)),
              accuracy: 0.7 + (0.25 * (epoch / totalEpochs))
            },
            resourceUsage: {
              gpuUtilization: 95,
              memoryUsage: 14000000000
            }
          } as TrainingMetrics,
          progress: {
            percentage: 10 + (85 * (epoch / totalEpochs)),
            message: `Training epoch ${epoch}/${totalEpochs}...`,
            eta: (totalEpochs - epoch) * 10
          }
        };
      }

      // Step 4: Final evaluation
      yield {
        status: 'pending',
        progress: {
          percentage: 95,
          message: 'Running final evaluation...',
          eta: 30
        }
      };

      // Simulate final evaluation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Return success with final model
      return {
        status: 'success',
        data: {
          model: {
            path: 's3://output/model-final.pt',
            metrics: {
              trainLoss: 0.123,
              validationLoss: 0.145,
              accuracy: 0.95
            },
            hyperparameters: input.model.hyperparameters
          },
          training: {
            duration: 3600,
            epochsCompleted: totalEpochs,
            learningCurve: Array.from({ length: totalEpochs }, (_, i) => ({
              epoch: i + 1,
              metrics: {
                loss: 0.5 - (0.3 * ((i + 1) / totalEpochs)),
                accuracy: 0.7 + (0.25 * ((i + 1) / totalEpochs))
              }
            }))
          },
          resources: {
            gpuHoursUsed: 1,
            peakMemoryUsage: 14000000000,
            costEstimate: 3.50
          }
        }
      };
    } catch (error: any) {
      return {
        status: 'error',
        error: {
          code: error.code || 'TRAINING_FAILED',
          message: error.message,
          retryable: error.code === 'GPU_UNAVAILABLE',
          userMessage: 'Training failed. Please check the logs for details.'
        }
      };
    }
  }
});
