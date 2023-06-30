export default function withTimeout<T>(promise: Promise<T>, ms: number, operationName: string): Promise<T> {
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation "${operationName}" timed out of ${ms}.`));
    }, ms);
  });

  return Promise.race<T>([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}
