import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"
import { RemoveSteamAccountPayload } from "./controller"
import { IntentionCodes } from "./view"

export async function httpRemoveSteamAccount(
  payload: RemoveSteamAccountPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.delete<any, AxiosResponse, RemoveSteamAccountPayload>(`/steam-accounts`, {
      data: payload,
    })
  )
  if (error) return [error, null]
  if (response.status === 200) {
    return [null, response.data.steamAccountID]
  }
  console.log({ response })
  return [msg.new("Resposta desconhecida.", "info"), null]
}
