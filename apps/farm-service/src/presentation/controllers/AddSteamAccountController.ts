import { AddSteamAccountHTTPResponse, Controller, HttpClient } from "core"
import { AddSteamAccountUseCase } from "~/application/use-cases/AddSteamAccountUseCase"

export namespace AddSteamAccountHandle {
  export type Payload = {
    accountName: string
    password: string
    userId: string
    authCode?: string
  }

  export type Response = AddSteamAccountHTTPResponse
}

export class AddSteamAccountController
  implements Controller<AddSteamAccountHandle.Payload, AddSteamAccountHandle.Response>
{
  constructor(private readonly addSteamAccountUseCase: AddSteamAccountUseCase) {}

  async handle({ payload }: APayload): AResponse {
    const [error, result] = await this.addSteamAccountUseCase.execute(payload)
    if (error) throw error
    return Promise.resolve({
      status: 201,
      json: result,
    })
  }
}

type APayload = HttpClient.Request<AddSteamAccountHandle.Payload>
type AResponse = Promise<HttpClient.Response<AddSteamAccountHandle.Response>>
