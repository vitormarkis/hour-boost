import { ApplicationError, HttpClient } from "core"

export async function promiseHandler(
  promise: Promise<HttpClient.Response>
): Promise<HttpClient.Response<any>> {
  try {
    const response = await promise
    return response
  } catch (error) {
    console.log(error)
    if (error instanceof ApplicationError) {
      return { status: error.status, json: { message: error.message } }
    }
    if (error instanceof Error) {
      return { status: 500, json: { message: error.message } }
    }
    return { status: 500, json: { message: "Erro interno no servidor." } }
  }
}
