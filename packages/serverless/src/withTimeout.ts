export default async function withTimeout<T>(promise: Promise<T>, options: {
  timeout: number,
  id: string,
  onTimeout?: () => void
}): Promise<T> {
  let isResolved = false;
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation "${options.id}" timed out of ${options.timeout}.`));
    }, options.timeout);
  });

  try {
    return await Promise.race<T>([
      promise.finally(() => {isResolved = true}),
      timeoutPromise
    ]);
  } finally {
    clearTimeout(timeoutId);
    if (!isResolved) {
      options.onTimeout?.();
    }
  }
}
