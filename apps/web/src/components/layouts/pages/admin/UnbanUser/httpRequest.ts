import { UserAdminActionUnbanUserPayload } from "./controller"
import { IntentionCodes } from "./types"
import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"

type UserAdminActionUnbanUserOutput = {
  message: string
}

export async function httpUserAdminActionUnbanUser(
  payload: UserAdminActionUnbanUserPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    (async () => {
      const { username } = payload
      await new Promise(res => setTimeout(res, 1500))
      return {
        status: 200,
        data: {
          message: `O usuário ${username} foi desbanido da plataforma.`,
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

// api.post<any, AxiosResponse<UserAdminActionUnbanUserOutput>, UserAdminActionUnbanUserPayload>(
//   "/farm/stop",
//   payload
