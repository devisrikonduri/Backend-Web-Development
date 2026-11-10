const DEFAULT_AVATAR = {
  url: 'https://cdn.aurora-profiles.dev/avatars/default.png',
  initials: '?',
  source: 'fallback',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryable(error) {
  if (!error) return false;
  if (error.name === 'AbortError') return true;           // timed out

  const status = error.status ?? error.statusCode;
  if (status === undefined) return true;                  // no HTTP status = network error
  return status === 429 || status >= 500;                 // rate limit or server error
}

async function withTimeout(operation, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Rejects when the timer fires, even if the operation ignores the signal.
  const aborted = new Promise((_, reject) => {
    controller.signal.addEventListener('abort', () => {
      const err = new Error(`Timed out after ${timeoutMs}ms`);
      err.name = 'AbortError';
      reject(err);
    });
  });

  try {
    return await Promise.race([operation(controller.signal), aborted]);
  } finally {
    clearTimeout(timer);
  }
}

async function withRetry(operation, options = {}) {
  const { maxAttempts = 3, baseDelayMs = 25 } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts - 1;
      if (!isRetryable(error) || isLastAttempt) throw error;
      await sleep(baseDelayMs * 2 ** attempt);   // 25ms, 50ms, 100ms...
    }
  }
}

async function getProfileWithAvatar(authorId, avatarClient, options = {}) {
  const timeoutMs = options.timeoutMs || 200;
  const maxAttempts = options.maxAttempts || 3;
  const baseDelayMs = options.baseDelayMs || 25;

  try {
    const avatar = await withRetry(
      () => withTimeout(
        signal => avatarClient.getAvatar(authorId, { signal }),
        timeoutMs
      ),
      { maxAttempts, baseDelayMs }
    );
    return { authorId, avatar, degraded: false };
  } catch (error) {
    return { authorId, avatar: DEFAULT_AVATAR, degraded: true };
  }
}

module.exports = {
  DEFAULT_AVATAR,
  sleep,
  isRetryable,
  withTimeout,
  withRetry,
  getProfileWithAvatar,
};