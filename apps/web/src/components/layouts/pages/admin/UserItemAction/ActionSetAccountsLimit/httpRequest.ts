import { DataOrMessage, MessageMaker } from "@/util/DataOrMessage"
import { resolvePromiseToMessage } from "@/util/resolvePromiseToMessage"
import { AxiosInstance, AxiosResponse } from "axios"
import { UserAdminActionSetAccountsPayload } from "./controller"
import { IntentionCodes } from "./types"

type UserAdminActionSetAccountsOutput = {
  message: string
}

export async function httpUserAdminActionSetAccounts(
  payload: UserAdminActionSetAccountsPayload,
  getAPI: () => Promise<AxiosInstance>,
  msg = new MessageMaker<IntentionCodes>()
): Promise<DataOrMessage<string, IntentionCodes>> {
  const api = await getAPI()
  const [error, response] = await resolvePromiseToMessage(
    (async () => {
      const { data, status } = await api.post<
        any,
        AxiosResponse<UserAdminActionSetAccountsOutput>,
        UserAdminActionSetAccountsPayload
      >("/admin/set-max-steam-accounts", payload)

      return {
        status: 200,
        data: {
          message: `Você mudou o limite de contas que o usuário pode ter no painel para ${payload.newMaxSteamAccountsAllowed}`,
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
// api.post<any, AxiosResponse<UserAdminActionSetAccountsOutput>, UserAdminActionSetAccountsPayload>(
//   "/farm/stop",
//   payload
