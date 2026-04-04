export async function runWithRetry<T>(
  task: () => Promise<T>,
  attempts: number,
  onRetry?: (attempt: number, error: unknown) => void,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (attempt < attempts) {
        onRetry?.(attempt, error);
      }
    }
  }

  throw lastError;
}
