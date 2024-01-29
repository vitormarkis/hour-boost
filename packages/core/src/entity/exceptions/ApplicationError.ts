export class ApplicationError<const TCode = string | undefined, P = any> extends Error {
  status: number
  details: any
  code?: TCode | undefined
  payload?: P

  constructor(message: string, status: number = 400, details?: any, code?: TCode | undefined, payload?: P) {
    super(message)
    this.status = status
    this.details = details
    this.code = code
    this.payload = payload
    console.log(`DETAILS: `, details)
    console.log(this.stack)
  }
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

type MutableDepper<T> = {
  -readonly [P in keyof T]: T[P] extends (infer U)[]
    ? MutableDepper<U>[]
    : T[P] extends object
      ? MutableDepper<T[P]>
      : T[P]
}

export type MutableDeep<T> = {
  -readonly [P in keyof T]: T[P] extends object ? MutableDeep<T[P]> : T[P]
}
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

export class Fail<
  const TCode extends string = string,
  const THTTPStatus = number,
  const TPayload extends Record<string, any> | undefined = Record<string, any> | undefined,
> extends Error {
  // payload: TPayload extends Record<string, any> ? TPayload : undefined
  payload: TPayload
  code: TCode
  httpStatus?: THTTPStatus

  constructor({
    code,
    httpStatus,
    payload = undefined,
  }: {
    code: TCode
    payload?: TPayload
    httpStatus?: THTTPStatus
  }) {
    super(code)
    this.code = code as TCode
    this.payload = payload as TPayload
    this.httpStatus = httpStatus
  }
}

const failInstance = new Fail({
  code: "CODE",
  httpStatus: 200,
  payload: {
    valid: true,
    message: "string",
  },
})

const FailInstance = typeof failInstance
