import {
  DataOrError,
  Fail,
  PlanRepository,
  SteamAccountClientStateCacheRepository,
  UseCase,
  UsersRepository,
} from "core"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { EAppResults } from "~/application/use-cases/RestoreAccountSessionUseCase"
import { persistUsagesOnDatabase } from "~/application/utils/persistUsagesOnDatabase"
import { AutoRestarterScheduler } from "~/domain/cron"

import { ApplicationError, DataOrFail } from "core"
import { nice, bad } from "~/utils/helpers"

export class RemoveSteamAccountUseCase implements IRemoveSteamAccountUseCase {
  private readonly codify = <const T extends string = string>(moduleCode: T) =>
    `[RemoveSteamAccountUseCase]:${moduleCode}` as const
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly planRepository: PlanRepository,
    private readonly autoRestarterScheduler: AutoRestarterScheduler
  ) {}

  async execute({ accountName, steamAccountId, userId, username }: RemoveSteamAccountUseCasePayload) {
    const user = await this.usersRepository.getByID(userId)
    if (!user) {
      const fail = new Fail({
        code: EAppResults["USER-NOT-FOUND"],
        httpStatus: 404,
        payload: {
          givenUserId: userId,
        },
      })
      return bad(fail)
    }
    const steamAccountIndex = user.steamAccounts.data.findIndex(
      acc => acc.credentials.accountName === accountName
    )
    if (steamAccountIndex < 0) {
      const fail = new Fail({
        code: EAppResults["STEAM-ACCOUNT-NOT-FOUND"],
        httpStatus: 404,
        payload: {
          foundSteamAccountsOnUser: user.steamAccounts.data.map(acc => acc.credentials.accountName),
          givenAccountName: accountName,
        },
      })

      return bad(fail)
    }

    const [errorFindingCluster, userCluster] = this.usersSACsFarmingClusterStorage.get(username)
    if (errorFindingCluster) return bad(errorFindingCluster)

    const isAccountFarming = userCluster.isAccountFarmingOnService(accountName)

    this.autoRestarterScheduler.stopCron(accountName)

    if (isAccountFarming) {
      const [errorPausingFarmOnAccount, usages] = userCluster.pauseFarmOnAccountSync({
        accountName,
        killSession: true,
      })
      if (errorPausingFarmOnAccount) {
        return bad(
          new Fail({
            code: `PAUSE-FARM-ON-ACCOUNT::${errorPausingFarmOnAccount.code ?? "UNKNOWN"}`,
            httpStatus: errorPausingFarmOnAccount.status,
            payload: errorPausingFarmOnAccount.payload,
          })
        )
      }

      const [errorPersistingUsages] = await persistUsagesOnDatabase(
        user.plan.id_plan,
        usages,
        this.planRepository
      )
      if (errorPersistingUsages) {
        return bad(
          new Fail({
            code: `PERSISTING-USAGES::${errorPersistingUsages.code ?? "UNKNOWN"}`,
            httpStatus: errorPersistingUsages.httpStatus,
            payload: errorPersistingUsages.payload,
          })
        )
      }
    }

    const steamAccount = user.steamAccounts.data[steamAccountIndex]
    steamAccount.autoRelogin = false
    user.steamAccounts.remove(steamAccountId)
    await this.usersRepository.update(user)

    await this.steamAccountClientStateCacheRepository.deleteAllEntriesFromAccount(accountName)

    this.allUsersClientsStorage.removeSteamAccount(userId, accountName)
    userCluster.removeSAC(accountName)
    return nice()
  }
}

export type RemoveSteamAccountUseCasePayload = {
  userId: string
  steamAccountId: string
  accountName: string
  username: string
}

interface IRemoveSteamAccountUseCase {
  execute(...args: any[]): Promise<DataOrFail<Fail>>
}
