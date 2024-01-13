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
  implements UseCase<RemoveSteamAccountUseCaseHandle.Payload, RemoveSteamAccountUseCaseHandle.Response>
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
    this.logger.log("[1/8] Finding user.")
    const user = await this.usersRepository.getByID(userId)
    if (!user) return [new ApplicationError("Usuário não encontrado.", 404)]

    this.logger.log("[2/8] Getting user cluster")
    const [clusterNotFound, userCluster] = this.usersSACsFarmingClusterStorage.get(username)

    if (clusterNotFound) return [new ApplicationError(`Cluster para [${username}] não encontrado.`)]

    const isAccountFarming = userCluster.isAccountFarming(accountName)
    this.logger.log(`[3/8] Account [${accountName}] is ${isAccountFarming ? "" : "NOT"} farming.`)

    if (isAccountFarming) {
      const [errorPausingFarmOnAccount, usages] = userCluster.pauseFarmOnAccountSync({
        accountName,
        killSession: true,
      })
      if (errorPausingFarmOnAccount) {
        console.log({
          [`farmingAccounts:[${accountName}]`]: userCluster.getAccountsStatus(),
        })
        return [errorPausingFarmOnAccount]
      }

      const [errorPersistingUsages] = await persistUsagesOnDatabase(
        user.plan.id_plan,
        usages,
        this.planRepository
      )
      if (errorPersistingUsages) return [errorPersistingUsages]
    }

    this.logger.log("[4/8] Removing steam account from user domain.")
    user.steamAccounts.remove(steamAccountId)
    this.logger.log("[5/8] Updating user on user repository.")
    await this.usersRepository.update(user)

    this.logger.log("[6/8] Deleting all session entries from cache.")
    await this.steamAccountClientStateCacheRepository.deleteAllEntriesFromAccount(accountName)

    this.logger.log("[7/8] Logging account off, and removing it from clients storage.")
    this.allUsersClientsStorage.removeSteamAccount(userId, accountName)
    this.logger.log("[8/8] Removing SAC from cluster.")
    userCluster.removeSAC(accountName)
    return [null, null]
  }
}

type APayload = RemoveSteamAccountUseCaseHandle.Payload
type AResponse = Promise<RemoveSteamAccountUseCaseHandle.Response>
