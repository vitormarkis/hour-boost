import { ApplicationError } from "core"
import { HttpClient } from "~/contracts"

export async function promiseHandler(promise: Promise<HttpClient.Response>): Promise<HttpClient.Response> {
  try {
    const response = await promise
    return response
  } catch (error) {
    if (error instanceof ApplicationError) {
      return { status: error.status, json: { message: error.message } }
    }
    if (error instanceof Error) {
      return { status: 500, json: { message: error.message } }
    }
    return { status: 500, json: { message: "Erro interno no servidor." } }
  }
}
