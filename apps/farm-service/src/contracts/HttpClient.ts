export namespace HttpClient {
  export interface Request<T extends Object = Object> {
    payload: T
  }
  export type Response<T extends Object = Object> = {
    json: T | Object | null
    status: number
  }
}
