import { ListSteamAccounts } from "core"
import { HttpClient } from "../../contracts/HttpClient"
import { makeResError } from "../../utils/makeResError"

export class ListSteamAccountsController {
  constructor(private readonly listSteamAccounts: ListSteamAccounts) {}

  async handle(
    req: HttpClient.Request<{
      userId: string
    }>
  ): Promise<HttpClient.Response<any>> {
    try {
      const output = await this.listSteamAccounts.execute({
        userId: req.payload.userId,
      })

      return {
        json: output,
        status: 200,
      }
    } catch (error) {
      return makeResError(error)
    }
  }
}
