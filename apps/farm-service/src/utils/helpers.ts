export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
type Prettify<T> = { [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K] } & unknown
type PrettifySoft<T> = { [K in keyof T]: T[K] } & unknown
type PrettifyOneLevel<T> = { [K in keyof T]: T[K] extends object ? PrettifySoft<T[K]> : T[K] } & unknown
type PrettifyTwoLevel<T> = { [K in keyof T]: T[K] extends object ? PrettifyOneLevel<T[K]> : T[K] } & unknown

export function fail<const T>(error: T) {
  return [error] as Mutable<[T]>
}

export function nice<const T = undefined>(result?: T) {
  return [null, result] as PrettifyOneLevel<Mutable<[null, T]>>
}

export type GetError<T extends (...args: any[]) => any> = T extends (...args: any) => Promise<infer R>
  ? R extends [infer E]
    ? NonNullable<E>
    : never
  : never

export type GetResult<T extends (...args: any[]) => any> = T extends (...args: any) => Promise<infer R>
  ? R extends [null, infer Res]
    ? Res
    : never
  : never

export type GetTuple<T extends (...args: any[]) => any> = T extends (...args: any) => Promise<infer R>
  ? R
  : never
