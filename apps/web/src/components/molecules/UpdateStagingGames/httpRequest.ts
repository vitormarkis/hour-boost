import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"
import { UpdateStagingGamesPayload } from "./controller"
import { IntentionCodes } from "./types"

type UpdateStagingGamesOutput = {
  message: string
}

export async function httpUpdateStagingGames(
  payload: UpdateStagingGamesPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.put<any, AxiosResponse<UpdateStagingGamesOutput>, UpdateStagingGamesPayload>(
      "/farm/staging/list",
      payload
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
