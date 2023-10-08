export default function withTimeout<T>(promise: Promise<T>, options: {timeout: number, id: string, clean?: () => void}): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation "${options.id}" timed out of ${options.timeout}.`));
    }, options.timeout);
  });

  return Promise.race<T>([
    promise.finally(() => {
      clearTimeout(timeoutId);
      options.clean?.();
    }),
    timeoutPromise
  ]);
}
