import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"
import { RefreshGamesPayload } from "./controller"
import { IntentionCodes } from "./types"

type RefreshGamesOutput = {
  message: string
}

export async function httpRefreshGames(
  payload: RefreshGamesPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.get<any, AxiosResponse<RefreshGamesOutput>, RefreshGamesPayload>(
      `/refresh-games?accountName=${payload.accountName}`
    )
  )
  if (error) {
    return [error]
  }
  if (response.status === 200) {
    return [null, response.data.message]
  }
  console.log({ response })
  return [msg.new("Resposta desconhecida.", "info")]
}
