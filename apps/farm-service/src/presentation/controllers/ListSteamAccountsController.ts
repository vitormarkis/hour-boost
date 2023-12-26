import { API_GET_SteamAccounts, Controller, HttpClient, ListSteamAccounts } from "core"

export namespace ListSteamAccountsHandle {
  export type Payload = {
    userId: string
  }

  export type Response = {}
}

export class ListSteamAccountsController
  implements Controller<ListSteamAccountsHandle.Payload, ListSteamAccountsHandle.Response>
{
  constructor(private readonly listSteamAccounts: ListSteamAccounts) {}
  async handle({ payload }: APayload): AResponse {
    const { steamAccounts } = await this.listSteamAccounts.execute({
      userId: payload.userId,
    })

    return {
      json: {
        steamAccounts,
      } as API_GET_SteamAccounts,
      status: 200,
    }
  }
}

type APayload = HttpClient.Request<ListSteamAccountsHandle.Payload>
type AResponse = Promise<HttpClient.Response<ListSteamAccountsHandle.Response>>
