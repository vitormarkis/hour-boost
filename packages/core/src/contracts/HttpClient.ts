export namespace HttpClient {
  export interface Request<T extends Record<string, any> = Record<string, any>> {
    payload: T
  }
  export type Response<T = Record<string, any>> = {
    json?: T
    status: number
  }
}
