import { StopFarmPayload } from "@/components/molecules/StopFarm/controller"
import { IntentionCodes } from "@/components/molecules/StopFarm/types"
import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"

type StopFarmOutput = {
  message: string
}

export async function httpStopFarm(
  payload: StopFarmPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    api.post<any, AxiosResponse<StopFarmOutput>, StopFarmPayload>("/farm/stop", payload)
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
