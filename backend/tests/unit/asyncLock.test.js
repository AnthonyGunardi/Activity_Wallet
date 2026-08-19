const { withKeyLock } = require('../../src/utils/asyncLock');

describe('asyncLock Utility Tests', () => {
  test('should execute operations under the same key sequentially', async () => {
    const sequence = [];

    const task1 = withKeyLock('user-1', async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      sequence.push('task1');
      return 'res1';
    });

    const task2 = withKeyLock('user-1', async () => {
      sequence.push('task2');
      return 'res2';
    });

    const [r1, r2] = await Promise.all([task1, task2]);

    expect(r1).toBe('res1');
    expect(r2).toBe('res2');
    expect(sequence).toEqual(['task1', 'task2']);
  });

  test('should allow operations under different keys to execute concurrently', async () => {
    const sequence = [];

    const task1 = withKeyLock('key-a', async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
      sequence.push('key-a');
    });

    const task2 = withKeyLock('key-b', async () => {
      sequence.push('key-b');
    });

    await Promise.all([task1, task2]);
    expect(sequence).toEqual(['key-b', 'key-a']);
  });

  test('should release lock cleanly even if task throws an error', async () => {
    const failingTask = withKeyLock('key-err', async () => {
      throw new Error('Task failure');
    });

    await expect(failingTask).rejects.toThrow('Task failure');

    // Next task on same key should succeed without hanging
    const subsequentTask = await withKeyLock('key-err', async () => {
      return 'recovered';
    });

    expect(subsequentTask).toBe('recovered');
  });
});
