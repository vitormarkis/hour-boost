export function getTimeoutPromise<T>(timeInSeconds: number, object: T): Promise<T> {
  return new Promise((res, rej) =>
    setTimeout(() => {
      rej(object)
    }, timeInSeconds * 1000).unref()
  )
}
