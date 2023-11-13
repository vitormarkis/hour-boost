export namespace HttpClient {
  export interface Request<T extends Object = Object> {
    payload: T
  }
  export type Response = {
    json?: Object | null
    status: number
  }
}
