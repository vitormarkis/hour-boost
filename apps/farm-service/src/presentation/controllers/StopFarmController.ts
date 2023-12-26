import { ApplicationError, Controller, HttpClient, UsersRepository } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"

export namespace StopFarmHandle {
  export type Payload = {
    userId: string
    accountName: string
  }

  export type Response = null | { message: string }
}

export class StopFarmController implements Controller<StopFarmHandle.Payload, StopFarmHandle.Response> {
  constructor(
    private readonly usersClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly usersRepository: UsersRepository
  ) {}

  async handle({ payload }: APayload): AResponse {
    const { userId, accountName } = payload
    const user = await this.usersRepository.getByID(payload.userId)
    if (!user) return { json: { message: "Usuário não encontrado." }, status: 404 }

    const userCluster = this.usersClusterStorage.get(user.username)
    if (!userCluster) throw new ApplicationError("Usuário não possui contas farmando.", 402)
    userCluster.pauseFarmOnAccount(payload.accountName)
    return { json: null, status: 200 }
  }
}

type APayload = HttpClient.Request<StopFarmHandle.Payload>
type AResponse = Promise<HttpClient.Response<StopFarmHandle.Response>>
