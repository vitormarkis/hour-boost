import { API_GET_SteamAccounts, ISteamAccountSession, ListSteamAccounts } from "core"

import { HttpClient } from "~/contracts/HttpClient"
import { makeResError } from "~/utils"

export class ListSteamAccountsController {
  constructor(private readonly listSteamAccounts: ListSteamAccounts) {}

  async handle(
    req: HttpClient.Request<{
      userId: string
    }>
  ): Promise<HttpClient.Response<API_GET_SteamAccounts>> {
    try {
      const output = await this.listSteamAccounts.execute({
        userId: req.payload.userId,
      })

      return {
        json: output,
        status: 200,
      }
    } catch (error) {
      console.log(error)
      return makeResError(error)
    }
  }
}
