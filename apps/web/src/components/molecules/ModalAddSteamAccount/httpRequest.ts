import { AxiosInstance, AxiosResponse } from "axios"
import { AddSteamAccountOutput, ApplicationError, DataOrError } from "core"
import { CreateSteamAccountPayload } from "./controller"

export async function httpCreateSteamAccount(
  payload: CreateSteamAccountPayload,
  getAPI: () => Promise<AxiosInstance>
): Promise<DataOrError<string>> {
  // await new Promise(res => setTimeout(res, 1000))
  // if (payload.authCode) return [null, "892j38429-93=459"]
  // return [new ApplicationError("Steam Guard needed.", 202), null]

  const api = await getAPI()
  const response = await api.post<any, AxiosResponse<AddSteamAccountOutput>, CreateSteamAccountPayload>(
    "/steam-accounts",
    payload
  )
  if (response.status === 202) return [new ApplicationError("Steam Guard needed.", 202), null]
  if (response.status === 201) return [null, response.data.steamAccountID]
  return [new ApplicationError("Erro desconhecido.", 500), null]
}
