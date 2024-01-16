import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"
import { FarmGamesPayload } from "./controller"
import { IntentionCodes } from "./types"

type FarmGamesOutput = {
  message: string
}

export async function httpFarmGames(
  payload: FarmGamesPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.post<any, AxiosResponse<FarmGamesOutput>, FarmGamesPayload>("/farm/start", payload)
  )
  if (error) {
    return [error]
  }
  if (response.status === 200) {
    return [null, response.data.message]
  }
  if (response.status === 202) {
    return [msg.new("Código Steam Guard requerido.", "info", "STEAM_GUARD_REQUIRED")]
  }
  console.log({ response })
  return [msg.new("Resposta desconhecida.", "info")]
}
