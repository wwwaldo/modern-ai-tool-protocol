/**
 * Example implementation of the Frame Protocol using a simple integer stream.
 * 
 * This demonstrates the key concepts of the Frame Protocol:
 * 1. State Management: Current value and sequence number
 * 2. Sequence Validation: Each operation validates against current sequence
 * 3. Query vs Mutation: 
 *    - Queries (getCurrentValue) don't change state or sequence
 *    - Mutations (incrementValue) update both state and sequence
 * 4. Frame-based Responses: All operations return frames with:
 *    - sequence: Current sequence number
 *    - type: 'full' | 'diff' | 'error'
 *    - content: Human-readable state description
 *    - value: Actual state data
 */

import { ToolDefinition } from '../compiler/types';
import { Frame } from '../types';

// Track current state
let currentValue = 0;
let currentSequence = 1;

// Extend Frame to include our state data
interface IntFrame extends Frame {
  value: number;
}

// 1. Query Tool: Get current value
// Note: Queries can run in parallel since they don't change state
export const getCurrentValue: ToolDefinition = {
  name: 'get_current_value',
  description: 'Get current value of the integer stream',
  type: 'query',
  input: {
    basedOnSequence: 'number'
  },
  async execute({ basedOnSequence }: { basedOnSequence: number }): Promise<IntFrame> {
    // Frame Protocol: Validate sequence number
    if (basedOnSequence !== currentSequence) {
      throw new Error('Invalid sequence number');
    }

    // Frame Protocol: Return current state as a frame
    return {
      sequence: currentSequence,
      type: 'full',
      content: `Value is ${currentValue}`,
      value: currentValue
    };
  }
};

// 2. Mutation Tool: Increment value
// Note: Mutations must be sequential since they change state
export const incrementValue: ToolDefinition = {
  name: 'increment_value',
  description: 'Increment the integer stream by a specified amount',
  type: 'mutation',
  input: {
    amount: 'number',
    basedOnSequence: 'number'
  },
  async execute({ amount, basedOnSequence }: { amount: number, basedOnSequence: number }): Promise<IntFrame> {
    // Frame Protocol: Validate sequence number
    if (basedOnSequence !== currentSequence) {
      throw new Error('Invalid sequence number');
    }

    // Frame Protocol: Update state and increment sequence
    currentValue += amount;
    currentSequence += 1;

    // Frame Protocol: Return new state as a frame
    return {
      sequence: currentSequence,
      type: 'full',
      content: `Value is now ${currentValue}`,
      value: currentValue
    };
  }
};
