export async function safer<TResult>(action: () => Promise<TResult>) {
  try {
    const actionReturn = await action()
    return [undefined, actionReturn] as const
  } catch (error) {
    if (error instanceof Error) {
      return [error, undefined] as const
    }
    return [new Error(JSON.stringify(error)), undefined] as const
  }
}
