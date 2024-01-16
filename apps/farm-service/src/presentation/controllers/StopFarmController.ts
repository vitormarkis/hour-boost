import { Controller, HttpClient, PlanRepository, UsersRepository } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"
import { persistUsagesOnDatabase } from "~/application/utils/persistUsagesOnDatabase"

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
    private readonly usersRepository: UsersRepository,
    private readonly planRepository: PlanRepository
  ) {}

  async handle({ payload }: APayload): AResponse {
    const { userId, accountName } = payload
    const user = await this.usersRepository.getByID(userId)
    if (!user) return { json: { message: "Usuário não encontrado." }, status: 404 }

    const [errorFindingUserCluster, userCluster] = this.usersClusterStorage.get(user.username)
    if (errorFindingUserCluster) throw errorFindingUserCluster
    const [errorPausingFarmOnAccount, usages] = userCluster.pauseFarmOnAccountSync({ accountName })
    if (errorPausingFarmOnAccount) throw errorPausingFarmOnAccount
    const [errorPersisting] = await persistUsagesOnDatabase(user.plan.id_plan, usages, this.planRepository)
    if (errorPersisting) throw errorPersisting
    return { json: null, status: 200 }
  }
}

type APayload = HttpClient.Request<StopFarmHandle.Payload>
type AResponse = Promise<HttpClient.Response<StopFarmHandle.Response>>
