import type { API_GET_SteamAccounts, Controller, HttpClient } from "core"
import type { ListUserSteamAccountsUseCase } from "~/application/use-cases/ListUserSteamAccountsUseCase"

export namespace ListSteamAccountsHandle {
  export type Payload = {
    userId: string
  }

  export type Response = API_GET_SteamAccounts
}

export class ListSteamAccountsController
  implements Controller<ListSteamAccountsHandle.Payload, ListSteamAccountsHandle.Response>
{
  constructor(private readonly listUserSteamAccounts: ListUserSteamAccountsUseCase) {}
  async handle({ payload }: APayload): AResponse {
    const { steamAccounts } = await this.listUserSteamAccounts.execute({
      userId: payload.userId,
    })

    return {
      json: {
        steamAccounts,
      },
      status: 200,
    }
  }
}

type APayload = HttpClient.Request<ListSteamAccountsHandle.Payload>
type AResponse = Promise<HttpClient.Response<ListSteamAccountsHandle.Response>>
