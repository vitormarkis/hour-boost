export function combine<
  const TExpected extends Record<string, unknown>,
  const TPart extends Partial<TExpected>,
  const TPre extends Partial<TExpected> = {},
>(part: TPart, pre: TPre, rest: Omit<TExpected, keyof TPart | keyof TPre>): TExpected {
  return { ...part, ...pre, ...rest } as TExpected
}
