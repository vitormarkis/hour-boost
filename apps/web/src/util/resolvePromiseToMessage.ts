import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { AxiosError } from "axios"

export async function resolvePromiseToMessage<TPromiseResponse, R>(
  promise: Promise<TPromiseResponse>
): Promise<DataOrMessage<TPromiseResponse>> {
  const msg = new MessageMaker()
  try {
    const promiseResponse = await promise
    return [null, promiseResponse]
  } catch (error) {
    console.log(error)
    if (error instanceof AxiosError && error.response?.data.message) {
      return [msg.new(error.response.data.message, "error")]
    }
    if (error.message) return [msg.new(error.message, "error")]
    return [msg.new("Erro desconhecido.", "error")]
  }
}
