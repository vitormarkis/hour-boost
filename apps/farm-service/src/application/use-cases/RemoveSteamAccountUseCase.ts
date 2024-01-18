import {
  ApplicationError,
  DataOrError,
  PlanRepository,
  SteamAccountClientStateCacheRepository,
  UseCase,
  UsersRepository,
} from "core"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { persistUsagesOnDatabase } from "~/application/utils/persistUsagesOnDatabase"
import { Logger } from "~/utils/Logger"

export namespace RemoveSteamAccountUseCaseHandle {
  export type Payload = {
    userId: string
    steamAccountId: string
    accountName: string
    username: string
  }

  export type Response = DataOrError<null>
}

export class RemoveSteamAccountUseCase
  implements UseCase<RemoveSteamAccountUseCaseHandle.Payload, AResponse>
{
  private readonly logger: Logger
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly planRepository: PlanRepository
  ) {
    this.logger = new Logger("Remove-Steam-Account-Use-Case")
  }

  async execute({ accountName, steamAccountId, userId, username }: APayload): AResponse {
    const user = await this.usersRepository.getByID(userId)
    if (!user) {
      return [new ApplicationError("Usuário não encontrado.", 404)]
    }

    const [clusterNotFound, userCluster] = this.usersSACsFarmingClusterStorage.get(username)

    if (clusterNotFound) {
      return [new ApplicationError(`Cluster para [${username}] não encontrado.`)]
    }

    const isAccountFarming = userCluster.isAccountFarming(accountName)

    if (isAccountFarming) {
      const [errorPausingFarmOnAccount, usages] = userCluster.pauseFarmOnAccountSync({
        accountName,
        killSession: true,
      })
      if (errorPausingFarmOnAccount) {
        return [errorPausingFarmOnAccount]
      }

      const [errorPersistingUsages] = await persistUsagesOnDatabase(
        user.plan.id_plan,
        usages,
        this.planRepository
      )
      if (errorPersistingUsages) {
        return [errorPersistingUsages]
      }
    }

    user.steamAccounts.remove(steamAccountId)
    await this.usersRepository.update(user)

    await this.steamAccountClientStateCacheRepository.deleteAllEntriesFromAccount(accountName)

    this.allUsersClientsStorage.removeSteamAccount(userId, accountName)
    userCluster.removeSAC(accountName)
    return [null, null]
  }
}

type APayload = RemoveSteamAccountUseCaseHandle.Payload
type AResponse = Promise<RemoveSteamAccountUseCaseHandle.Response>
