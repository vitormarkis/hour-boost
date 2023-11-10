import { AddSteamAccount, AddSteamAccountOutput, IAddSteamAccount } from "core"

import { HttpClient } from "~/contracts/HttpClient"

export class CreateSteamAccountController {
  constructor(private readonly addSteamAccount: AddSteamAccount) {}

  async handle(
    req: HttpClient.Request<IAddSteamAccount>
  ): Promise<HttpClient.Response<AddSteamAccountOutput>> {
    try {
      const input = req.payload as IAddSteamAccount
      const output = await this.addSteamAccount.execute(input)
      return {
        json: output,
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
