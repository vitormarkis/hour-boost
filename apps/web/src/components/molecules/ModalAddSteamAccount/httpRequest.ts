import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"
import { AddSteamAccountHTTPResponse } from "core"
import { CreateSteamAccountPayload } from "./controller"
import { IntentionCodes } from "./view"

export async function httpCreateSteamAccount(
  payload: CreateSteamAccountPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.post<any, AxiosResponse<AddSteamAccountHTTPResponse>, CreateSteamAccountPayload>(
      "/steam-accounts",
      payload
    )
  )
  if (error) return [error]
  if (response.status === 201) {
    return [null, response.data.steamAccountId]
  }
  if (response.status === 202) {
    return [msg.new("Código Steam Guard requerido.", "info", "STEAM_GUARD_REQUIRED")]
  }
  console.log({ response })
  return [msg.new("Resposta desconhecida.", "info")]
}
