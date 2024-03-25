import {
  DataOrFail,
  EditablePlan,
  Fail,
  PlanRepository,
  SteamAccountClientStateCacheRepository,
  UsersRepository,
} from "core"
import { FlushUpdateSteamAccountUseCase } from "~/application/use-cases/FlushUpdateSteamAccountUseCase"
import { uc } from "~/application/use-cases/helpers"
import { persistUsagesOnDatabase } from "~/application/utils/persistUsagesOnDatabase"
import { TrimSteamAccounts } from "~/domain/utils/trim-steam-accounts"
import { bad, nice } from "~/utils/helpers"

export class SetMaxSteamAccountsUseCase implements ISetMaxSteamAccountsUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly flushUpdateSteamAccountUseCase: FlushUpdateSteamAccountUseCase,
    private readonly trimSteamAccounts: TrimSteamAccounts,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly planRepository: PlanRepository
  ) {}

  async execute({ mutatingUserId, newMaxSteamAccountsAllowed }: SetMaxSteamAccountsUseCasePayload) {
    const [errorGettingUser, user] = await uc.getUser(this.usersRepository, mutatingUserId)
    if (errorGettingUser) return bad(errorGettingUser)

    const editablePlan = new EditablePlan(user.plan)
    editablePlan.setMaxAccountsAmount(newMaxSteamAccountsAllowed)
    const [errorTrimmingAccounts, trimSteamAccountsInfo] = this.trimSteamAccounts.execute({
      user,
    })
    if (errorTrimmingAccounts) return bad(errorTrimmingAccounts)

    const [error] = await this.flushUpdateSteamAccountUseCase.execute({
      user,
    })
    if (error) return bad(error)
    const persistUsagesList = await Promise.all(
      trimSteamAccountsInfo.removeSteamAccountsResults.map(([error, value]) => {
        if (error) return bad(error)
        if (value.stopFarmUsages) {
          persistUsagesOnDatabase(user.plan.id_plan, value.stopFarmUsages, this.planRepository)
        }
        return nice()
      })
    )
    const persistUsagesListErrorsOnly = persistUsagesList.filter(
      ([persistUsageResultError]) => !!persistUsageResultError
    )
    if (persistUsagesListErrorsOnly.length) {
      const persistUsagesListErrorsOnlyExtracted = persistUsagesListErrorsOnly.map(([error]) => bad(error))
      return bad(
        Fail.create("COULD-NOT-PERSIST-ACCOUNT-USAGE", 400, {
          persistUsagesListErrors: persistUsagesListErrorsOnlyExtracted,
        })
      )
    }
    for (const accountName of trimSteamAccountsInfo.trimmingAccountsName) {
      await this.steamAccountClientStateCacheRepository.deleteAllEntriesFromAccount(accountName)
    }
    await this.usersRepository.update(user)

    return nice(user)
  }
}

export type SetMaxSteamAccountsUseCasePayload = {
  mutatingUserId: string
  newMaxSteamAccountsAllowed: number
}

interface ISetMaxSteamAccountsUseCase {
  execute(...args: any[]): Promise<DataOrFail<Fail>>
}
