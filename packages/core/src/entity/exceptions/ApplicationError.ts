export class ApplicationError<const TCode = string | undefined, P = any> extends Error {
  status: number
  details: any
  code?: TCode | undefined
  payload?: P

  constructor(message: string, status: number = 400, details?: any, code?: TCode | undefined, payload?: P) {
    super(message)
    this.status = status
    this.details = details
    this.code = code as Mutable<TCode>
    this.payload = payload
    console.log(`DETAILS: `, details)
    console.log(this.stack)
  }
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
type Prettify<T> = { [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K] } & unknown
type PrettifySoft<T> = { [K in keyof T]: T[K] } & unknown
type PrettifyOneLevel<T> = { [K in keyof T]: T[K] extends object ? PrettifyOneLevel<T[K]> : T[K] } & unknown
type PrettifyTwoLevel<T> = { [K in keyof T]: T[K] extends object ? PrettifySoft<T[K]> : T[K] } & unknown

export function fail<const T>(error: T) {
  return [error] as Mutable<[T]>
}

const mason = () => {
  return new ApplicationError("Wasn't able to connect to Steam.", 400, undefined, undefined, {})
}
