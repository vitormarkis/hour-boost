import { UserAdminActionSetGamesPayload } from "./controller"
import { IntentionCodes } from "./types"
import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"

type UserAdminActionSetGamesOutput = {
  message: string
}

export async function httpUserAdminActionSetGames(
  payload: UserAdminActionSetGamesPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    (async () => {
      const { data, status } = await api.post<
        any,
        AxiosResponse<UserAdminActionSetGamesOutput>,
        UserAdminActionSetGamesPayload
      >("/admin/add-more-games", payload)

      console.log({ data, status })

      return {
        status: 200,
        data: {
          message: `Você mudou o limite de jogos farmados simultâneamente para ${payload.newMaxGamesAllowed}`,
        },
      }
    })()
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
