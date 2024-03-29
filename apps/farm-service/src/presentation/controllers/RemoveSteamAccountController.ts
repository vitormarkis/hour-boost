import type { Controller, HttpClient } from "core"
import type { RemoveSteamAccountUseCase } from "~/application/use-cases/RemoveSteamAccountUseCase"
import { makeRes } from "~/utils"

export namespace RemoveSteamAccountControllerHandle {
  export type Payload = {
    userId: string
    steamAccountId: string
    accountName: string
    username: string
  }

  export type Response = {
    message: string
  }
}

export class RemoveSteamAccountControllerController
  implements
    Controller<RemoveSteamAccountControllerHandle.Payload, RemoveSteamAccountControllerHandle.Response>
{
  constructor(private readonly removeSteamAccountUseCase: RemoveSteamAccountUseCase) {}

  async handle({ payload }: APayload): AResponse {
    const { steamAccountId, userId, accountName, username } = payload
    const [errorRemovingAccount] = await this.removeSteamAccountUseCase.execute({
      userId,
      accountName,
    })
    if (errorRemovingAccount) throw errorRemovingAccount

    return makeRes(200, `A conta [${steamAccountId}] foi desvinculada do seu perfil.`)
  }
}

type APayload = HttpClient.Request<RemoveSteamAccountControllerHandle.Payload>
type AResponse = Promise<HttpClient.Response<RemoveSteamAccountControllerHandle.Response>>
