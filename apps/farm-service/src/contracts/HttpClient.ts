export namespace HttpClient {
  export interface Request<T extends Record<string, any> = Record<string, any>> {
    payload: T
  }
  export type Response = {
    json?: Record<string, any> | null
    status: number
  }
}
