import { parallel } from '../parallel';
import { getClickableElements, clickElement } from '../../tools/web';

describe('Parallel Tool Execution', () => {
  it('executes query tools in parallel', async () => {
    const result = await parallel(
      [getClickableElements, getClickableElements],
      [
        { basedOnSequence: 1, type: 'button' },
        { basedOnSequence: 1, type: 'link' }
      ]
    );
    expect(result).toHaveLength(2);
  });

  it('fails if mixing queries and mutations', async () => {
    await expect(
      parallel(
        [getClickableElements, clickElement],
        [
          { basedOnSequence: 1 },
          { basedOnSequence: 1, selector: '#button' }
        ]
      )
    ).rejects.toThrow('parallel() can only be used with query tools');
  });

  it('fails if sequence numbers differ', async () => {
    await expect(
      parallel(
        [getClickableElements, getClickableElements],
        [
          { basedOnSequence: 1 },
          { basedOnSequence: 2 }
        ]
      )
    ).rejects.toThrow('All parallel tools must use the same sequence number');
  });
});
