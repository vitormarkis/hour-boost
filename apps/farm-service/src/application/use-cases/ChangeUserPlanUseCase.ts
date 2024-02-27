import {
  CacheState,
  DataOrFail,
  Fail,
  GetError,
  PlanAllNames,
  SteamAccountClientStateCacheRepository,
  User,
  UsersRepository,
} from "core"
import { PlanService } from "~/domain/services/PlanService"
import { bad, nice } from "~/utils/helpers"
import { trimAccountsName } from "~/utils/trimAccountsName"
import { updateCacheStates } from "~/utils/updateCacheStates"
import { EAppResults, RemoveSteamAccountUseCase, RestoreAccountSessionUseCase } from "."
import { AllUsersClientsStorage } from "../services"
import { UserService } from "~/domain/services/UserService"
import { getUserSACs_OnStorage_ByUser, getUserSACs_OnStorage_ByUserId } from "~/utils/getUser"

export class ChangeUserPlanUseCase implements IChangeUserPlanUseCase {
  constructor(
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersRepository: UsersRepository,
    private readonly planService: PlanService,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly removeSteamAccountUseCase: RemoveSteamAccountUseCase,
    private readonly restoreAccountSessionUseCase: RestoreAccountSessionUseCase,
    private readonly userService: UserService
  ) {}

  private async executeImpl({ user, newPlanName }: ChangeUserPlanUseCasePayload) {
    const [errorChangingPlan, newPlan] = this.planService.createPlan({ currentPlan: user.plan, newPlanName })
    if (errorChangingPlan) return bad(errorChangingPlan)

    const trimmingAccountsName = trimAccountsName({
      newPlan,
      steamAccounts: user.steamAccounts.data,
    })

    console.log({
      steamAccounts: user.steamAccounts.data,
      trimmingAccountsName,
    })

    let failsTrimmingAccount: Fail[] = []
    if (trimmingAccountsName.length) {
      for (const accountName of trimmingAccountsName) {
        const [error] = await this.removeSteamAccountUseCase.execute({
          accountName,
          steamAccountId: user.steamAccounts.data.find(sa => sa.credentials.accountName === accountName)!
            .id_steamAccount,
          userId: user.id_user,
          username: user.username,
        })

        if (error) failsTrimmingAccount.push(error)
      }
    }

    if (failsTrimmingAccount.length) return bad({ code: "LIST::TRIMMING-ACCOUNTS", failsTrimmingAccount })

    const [errorGettingUserSACList, userSacList] = getUserSACs_OnStorage_ByUser(
      user,
      this.allUsersClientsStorage
    )
    if (errorGettingUserSACList) return bad(errorGettingUserSACList)

    if (!hasOnlyTruthyValues(userSacList))
      return bad(
        Fail.create("SOME-USER-ACCOUNTS-DO-NOT-HAVE-SAC-IN-MEMORY", 400, {
          userStorage: this.allUsersClientsStorage.get(user.id_user),
          user,
        })
      )

    const currentSACStates = userSacList.map(sac => sac.getCache())
    const { updatedCacheStates } = this.userService.changePlan(user, newPlan, currentSACStates)

    let fails: Fail[] = []
    for (const state of updatedCacheStates) {
      await this.steamAccountClientStateCacheRepository.save(state)
      const [error] = await this.restoreAccountSessionUseCase.execute({
        plan: newPlan,
        sac: userSacList.find(sac => sac.accountName === state.accountName)!,
        username: user.username,
        state,
      })
      if (error && error?.code !== "[RestoreAccountSessionUseCase]::SAC-NOT-LOGGED") fails.push(error)
    }

    if (fails.length > 0) {
      console.log("NSTH: had a list to restore account session, but some failed", fails)
      return bad({ code: "LIST::UPDATING-CACHE", fails })
    }

    await this.usersRepository.update(user)
    return nice()
  }

  async execute(props: ChangeUserPlanUseCasePayload) {
    const [error, result] = await this.executeImpl(props)
    if (error) {
      return this.handleFail(error, props)
    }
    return nice(result)
  }

  handleFail(error: GetError<ChangeUserPlanUseCase["executeImpl"]>, props: ChangeUserPlanUseCasePayload) {
    switch (error.code) {
      case "SOME-USER-ACCOUNTS-DO-NOT-HAVE-SAC-IN-MEMORY":
      case "LIST::TRIMMING-ACCOUNTS":
      case "LIST::UPDATING-CACHE":
      case "USER-STORAGE-NOT-FOUND":
        return bad(error)
    }
  }
}

export type ChangeUserPlanUseCasePayload = {
  user: User
  newPlanName: PlanAllNames
}

interface IChangeUserPlanUseCase {
  execute(...args: any[]): Promise<DataOrFail<any>>
  handleFail(...args: any[]): DataOrFail<any>
}
function hasOnlyTruthyValues<T>(value: (NonNullable<T> | null)[]): value is NonNullable<T>[] {
  return !value.includes(null)
}
