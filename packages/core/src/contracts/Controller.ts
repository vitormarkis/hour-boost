import { HttpClient } from "./HttpClient"

export interface Controller<P extends Record<string, any> = Record<string, any>, R = any> {
  handle(payload: HttpClient.Request<P>): Promise<HttpClient.Response<R>>
}
