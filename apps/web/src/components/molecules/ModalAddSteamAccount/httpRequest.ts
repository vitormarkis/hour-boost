import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"
import { AddSteamAccountOutput } from "core"
import { CreateSteamAccountPayload } from "./controller"
import { IntentionCodes } from "./view"

export async function httpCreateSteamAccount(
  payload: CreateSteamAccountPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.post<any, AxiosResponse<AddSteamAccountOutput>, CreateSteamAccountPayload>("/steam-accounts", payload)
  )
  if (error) return [error, null]
  if (response.status === 201) {
    return [null, response.data.steamAccountID]
  }
  if (response.status === 202) {
    return [msg.new("Código Steam Guard requerido.", "info", "STEAM_GUARD_REQUIRED"), null]
  }
  console.log({ response })
  return [msg.new("Resposta desconhecida.", "info"), null]
}
