import { API_GET_SteamAccounts, ISteamAccountSession, ListSteamAccounts } from "core"

import { HttpClient } from "~/contracts/HttpClient"
import { makeResError } from "~/utils"

export class ListSteamAccountsController {
  constructor(private readonly listSteamAccounts: ListSteamAccounts) {}

  async handle(
    req: HttpClient.Request<{
      userId: string
    }>
  ): Promise<HttpClient.Response> {
    try {
      const { steamAccounts } = await this.listSteamAccounts.execute({
        userId: req.payload.userId,
      })

      return {
        json: {
          steamAccounts,
        } as API_GET_SteamAccounts,
        status: 200,
      }
    } catch (error) {
      console.log(error)
      return makeResError(error)
    }
  }
}
