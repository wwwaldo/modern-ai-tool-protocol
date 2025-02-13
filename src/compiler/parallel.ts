import { ToolDefinition } from './types';

/**
 * Execute multiple query tools in parallel.
 * All tools must be queries (not mutations) and use the same sequence number.
 */
export async function parallel<T extends any[]>(
  tools: ToolDefinition[],
  inputs: Record<string, any>[]
): Promise<T> {
  // Validate all tools are queries
  if (!tools.every(t => t.type === 'query')) {
    throw new Error('parallel() can only be used with query tools');
  }

  // Validate all inputs have same sequence number
  const sequences = inputs.map(i => i.basedOnSequence);
  if (!sequences.every(s => s === sequences[0])) {
    throw new Error('All parallel tools must use the same sequence number');
  }

  // Execute all tools in parallel
  return Promise.all(
    tools.map((tool, i) => tool.execute(inputs[i]))
  ) as Promise<T>;
}
