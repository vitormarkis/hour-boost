export function keys<
  const T extends Record<string, any>,
  const TKey extends keyof T = keyof T,
  TResult extends Pick<T, TKey> = Pick<T, TKey>,
>(subject: T, keys: Array<TKey>) {
  const finalResult = {} as any
  for (const key of keys) {
    finalResult[key] = subject[key]
  }
  return finalResult as TResult
}

export function exchange<const T extends Record<string, any>, const TKey extends keyof T = keyof T>(
  subject: T,
  key: TKey,
  filteredKeys: Array<keyof T[TKey]>
) {
  const finalResult = subject[key]
  return keys(finalResult, filteredKeys)
}

type Todo = any
export function exchangeList<const T extends Record<string, any>, const TKey extends keyof T = keyof T>(
  subject: T[],
  filteredKeys: Todo
  // filteredKeys: Array<keyof T[TKey]>
) {
  const finalResult = subject.map(s => keys(s, filteredKeys))
  return finalResult
}
