import { UserAdminActionAddHoursPayload } from "./controller"
import { IntentionCodes } from "./types"
import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"

type UserAdminActionAddHoursOutput = {
  message: string
}

export async function httpUserAdminActionAddHours(
  payload: UserAdminActionAddHoursPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    (async () => {
      const { hoursAddingInSeconds } = payload
      await new Promise(res => setTimeout(res, 1500))
      return {
        status: 200,
        data: {
          message: `Você adicionou ${hoursAddingInSeconds / 60 / 60} horas a mais no plano.`,
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

// api.post<any, AxiosResponse<UserAdminActionAddHoursOutput>, UserAdminActionAddHoursPayload>(
//   "/farm/stop",
//   payload
