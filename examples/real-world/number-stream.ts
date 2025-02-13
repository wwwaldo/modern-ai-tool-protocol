import { createTool, ToolResponse } from '../../src';

interface NumberStreamInput {
  min?: number;
  max?: number;
  duration?: number; // How many seconds to run
}

interface NumberStreamOutput {
  currentNumber: number;
  timestamp: number;
}

const numberStreamTool = createTool<NumberStreamInput, NumberStreamOutput>({
  version: '1.0.0',
  metadata: {
    id: 'number-stream',
    name: 'Number Stream Generator',
    category: 'demo',
    tags: ['stream', 'demo', 'numbers']
  },

  documentation: {
    description: 'Generates a stream of random numbers, one per second',
    examples: [
      {
        input: { min: 0, max: 100, duration: 5 },
        output: {
          currentNumber: 42,
          timestamp: 1676901234567
        },
        description: 'Generate numbers between 0 and 100 for 5 seconds'
      }
    ]
  },

  async *execute(input: NumberStreamInput): AsyncGenerator<ToolResponse<NumberStreamOutput>> {
    const min = input.min ?? 0;
    const max = input.max ?? 100;
    const duration = input.duration ?? 10;

    for (let i = 0; i < duration; i++) {
      const number = Math.floor(Math.random() * (max - min + 1)) + min;
      
      yield {
        status: 'success',
        data: {
          currentNumber: number,
          timestamp: Date.now()
        }
      };

      // Wait 1 second before next number
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
});

export default numberStreamTool;
