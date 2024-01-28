import { ToggleAutoReloginPayload } from "@/components/molecules/ToggleAutoRelogin/controller"
import { IntentionCodes } from "@/components/molecules/ToggleAutoRelogin/types"
import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"

type ToggleAutoReloginOutput = {
  message: string
}

export async function httpToggleAutoRelogin(
  payload: ToggleAutoReloginPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.patch<any, AxiosResponse<ToggleAutoReloginOutput>, ToggleAutoReloginPayload>(
      "/account/auto-relogin",
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
