const locks = new Map();

/**
 * Executes an asynchronous function under a named mutual exclusion lock.
 * Subsequent calls for the same key will wait in sequence until preceding calls settle.
 *
 * @template T
 * @param {string} key - Unique resource lock identifier (e.g. participant QR code)
 * @param {() => Promise<T>} task - Asynchronous work to execute exclusively
 * @returns {Promise<T>}
 */
async function withKeyLock(key, task) {
  const currentLock = locks.get(key) || Promise.resolve();
  let release;
  const nextLock = new Promise((resolve) => {
    release = resolve;
  });

  locks.set(key, currentLock.then(() => nextLock));

  try {
    await currentLock;
    return await task();
  } finally {
    release();
    if (locks.get(key) === nextLock) {
      locks.delete(key);
    }
  }
}

module.exports = {
  withKeyLock
};
