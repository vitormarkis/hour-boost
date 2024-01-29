import { ApplicationError, HttpClient } from "core"

export const promiseHandler = (async <T>(
  promise: T extends Promise<HttpClient.Response> ? T : never
): Promise<T extends Promise<infer R> ? R : never> => {
  try {
    const { status, json } = await promise
    return { status, json: json } as T extends Promise<infer R> ? R : never
  } catch (error) {
    console.log(error)
    if (error instanceof ApplicationError) {
      return { status: error.status, json: { message: error.message } } as T extends Promise<infer R>
        ? R
        : never
    }
    if (error instanceof Error) {
      return { status: 500, json: { message: error.message } } as T extends Promise<infer R> ? R : never
    }
    return { status: 500, json: { message: "Erro interno no servidor." } } as T extends Promise<infer R>
      ? R
      : never
  }
}) satisfies <T>(promise: T extends Promise<HttpClient.Response> ? T : never) => Promise<HttpClient.Response>

export const promiseHandlerBroad = (async <T>(
  promise: T extends Promise<HttpClient.Response> ? T : never
): Promise<T extends Promise<infer R> ? R : never> => {
  try {
    const promiseResponse = await promise
    return promiseResponse as T extends Promise<infer R> ? R : never
  } catch (error) {
    console.log(error)
    if (error instanceof ApplicationError) {
      return { status: error.status, json: { message: error.message } } as T extends Promise<infer R>
        ? R
        : never
    }
    if (error instanceof Error) {
      return { status: 500, json: { message: error.message } } as T extends Promise<infer R> ? R : never
    }
    return { status: 500, json: { message: "Erro interno no servidor." } } as T extends Promise<infer R>
      ? R
      : never
  }
}) satisfies <T>(promise: T extends Promise<HttpClient.Response> ? T : never) => Promise<HttpClient.Response>
