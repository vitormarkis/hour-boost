import { ApplicationError, Controller, HttpClient } from "core"
import { StopAllFarms } from "~/application/use-cases"

export namespace StopAllFarmsHandle {
  export type Payload = {
    secret: string
  }

  export type Response = {}
}

export class StopAllFarmsController
  implements Controller<StopAllFarmsHandle.Payload, StopAllFarmsHandle.Response>
{
  constructor(private readonly stopAllFarmsUseCase: StopAllFarms) {}
  async handle({ payload }: APayload): AResponse {
    const { secret } = payload
    if (secret !== process.env.ACTIONS_SECRET) {
      throw new ApplicationError("Secret incorreta.")
    }
    this.stopAllFarmsUseCase.execute({ isFinalizingSession: false })

    return {
      status: 200,
      json: {
        message: "Todos os farms foram pausados.",
      },
    }
  }
}

type APayload = HttpClient.Request<StopAllFarmsHandle.Payload>
type AResponse = Promise<HttpClient.Response<StopAllFarmsHandle.Response>>
