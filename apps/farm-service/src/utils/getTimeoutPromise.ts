export function getTimeoutPromise<T>(timeInSeconds: number, object: T): Promise<T> {
  return new Promise(res =>
    setTimeout(() => {
      res(object)
    }, timeInSeconds * 1000)
  )
}
