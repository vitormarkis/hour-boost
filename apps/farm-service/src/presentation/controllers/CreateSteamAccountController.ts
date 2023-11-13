import { AddSteamAccount, AddSteamAccountOutput, IAddSteamAccount } from "core"

import { HttpClient } from "~/contracts/HttpClient"

export class CreateSteamAccountController {
  constructor(private readonly addSteamAccount: AddSteamAccount) {}

  async handle(req: HttpClient.Request<IAddSteamAccount>): Promise<HttpClient.Response> {
    try {
      const input = req.payload as IAddSteamAccount
      const { steamAccountID } = await this.addSteamAccount.execute(input)
      return {
        json: {
          steamAccountID,
        } as AddSteamAccountOutput,
        status: 201,
      }
    } catch (error) {
      return {
        json: {
          message: error instanceof Error ? error.message : "Erro interno no servidor.",
        },
        status: 500,
      }
    }
  }
}
