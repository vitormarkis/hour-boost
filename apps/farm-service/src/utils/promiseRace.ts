type DataOrError<T> = [error: ErrorPromiseTimeout, data: null] | [error: null, data: T]

export async function promiseRace<T extends Promise<any>>(
  promise: T,
  timeoutInMs: number,
  subject: string,
  message?: string
): Promise<DataOrError<Awaited<T>>> {
  try {
    const res = await Promise.race<T>([promise, new Promise((_, rej) => setTimeout(rej, timeoutInMs))])
    return [null, res]
  } catch (error) {
    return [new ErrorPromiseTimeout(subject, message), null]
  }
}

class ErrorPromiseTimeout {
  readonly message: string
  constructor(
    readonly subject: string,
    message?: string
  ) {
    this.message = `>> Promise timeout${message ? ` ${message}` : "."}`
  }
}
