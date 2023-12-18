import { ApplicationError } from "core"
import { StopAllFarms } from "~/application/use-cases/StopAllFarms"
import { HttpClient } from "~/contracts"

export class StopAllFarmsController {
  constructor(private readonly stopAllFarmsUseCase: StopAllFarms) {}

  async handle(
    req: HttpClient.Request<{
      secret: string
    }>
  ): Promise<HttpClient.Response> {
    const { secret } = req.payload
    if (secret !== process.env.ACTIONS_SECRET) {
      throw new ApplicationError("Secret incorreta.")
    }
    this.stopAllFarmsUseCase.execute()

    return {
      status: 200,
      json: {
        message: "Todos os farms foram pausados.",
      },
    }
  }
}
