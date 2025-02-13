import { getCurrentValue, incrementValue } from '../int-stream';
import { parallel } from '../../compiler/parallel';
import { compileToOpenAI } from '../../compiler';

describe('IntStream Tools', () => {
  it('compiles to OpenAI format', () => {
    const getCurrentValueOpenAI = compileToOpenAI(getCurrentValue);
    expect(getCurrentValueOpenAI).toEqual({
      name: 'get_current_value',
      description: 'Get current value of the integer stream',
      parameters: {
        type: 'object',
        properties: {
          basedOnSequence: {
            type: 'number',
            description: 'Parameter basedOnSequence of type number'
          }
        },
        required: ['basedOnSequence']
      }
    });
  });

  it('validates sequence numbers', async () => {
    // First call should work
    const result1 = await getCurrentValue.execute({ basedOnSequence: 1 });
    expect(result1.sequence).toBe(1);
    expect(result1.value).toBe(0);

    // Increment changes sequence
    const result2 = await incrementValue.execute({ basedOnSequence: 1, amount: 5 });
    expect(result2.sequence).toBe(2);
    expect(result2.value).toBe(5);

    // Old sequence should fail
    await expect(
      getCurrentValue.execute({ basedOnSequence: 1 })
    ).rejects.toThrow('Invalid sequence number');
  });

  it('allows parallel queries with same sequence', async () => {
    const results = await parallel(
      [getCurrentValue, getCurrentValue],
      [
        { basedOnSequence: 2 },
        { basedOnSequence: 2 }
      ]
    );
    expect(results).toHaveLength(2);
    expect(results[0].value).toBe(results[1].value);
  });

  it('prevents parallel mutations', async () => {
    await expect(
      parallel(
        [incrementValue, incrementValue],
        [
          { basedOnSequence: 2, amount: 1 },
          { basedOnSequence: 2, amount: 1 }
        ]
      )
    ).rejects.toThrow('parallel() can only be used with query tools');
  });
});
