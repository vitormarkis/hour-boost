import { ApplicationError, DataOrFail, Fail, PlanRepository } from "core"
import { bad, nice } from "~/utils/helpers"
import { UsersSACsFarmingClusterStorage } from "../services"
import { persistUsagesOnDatabase } from "../utils/persistUsagesOnDatabase"

type Options = {
  persistUsages: boolean
}

export class StopFarmUseCase implements IStopFarmUseCase {
  constructor(
    private readonly usersClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly planRepository: PlanRepository
  ) {}

  async execute(
    { planId, accountName, username, isFinalizingSession }: StopFarmUseCasePayload,
    options = { persistUsages: true } as Options
  ) {
    const [errorFindingUserCluster, userCluster] = this.usersClusterStorage.get(username)
    if (errorFindingUserCluster) return bad(errorFindingUserCluster)

    const [errorPausingFarmOnAccount, usages] = userCluster.pauseFarmOnAccountSync({ accountName, isFinalizingSession })
    if (errorPausingFarmOnAccount) return bad(errorPausingFarmOnAccount)

    if (options.persistUsages) {
      const [errorPersisting] = await persistUsagesOnDatabase(planId, usages, this.planRepository)
      if (errorPersisting) return bad(errorPersisting)
    }

    return nice({ usages, planId })
  }
}

export type StopFarmUseCasePayload = {
  planId: string
  username: string
  accountName: string
  isFinalizingSession: boolean
}

interface IStopFarmUseCase {
  execute(...args: any[]): Promise<DataOrFail<ApplicationError | Fail, object>>
}
