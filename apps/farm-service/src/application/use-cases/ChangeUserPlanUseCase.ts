import type {
  DataOrFail,
  Fail,
  GetError,
  PlanAllNames,
  SteamAccountClientStateCacheRepository,
  User,
  UsersRepository,
} from "core"
import type { PlanService } from "~/domain/services/PlanService"
import type { UserService } from "~/domain/services/UserService"
import { getUserSACs_OnStorage_ByUser } from "~/utils/getUser"
import { bad, nice } from "~/utils/helpers"
import { trimAccountsName } from "~/utils/trimAccountsName"
import type { RemoveSteamAccountUseCase, RestoreAccountSessionUseCase } from "."
import type { AllUsersClientsStorage } from "../services"

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

    const failsTrimmingAccount: Fail[] = []
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

    const currentSACStates = userSacList.map(sac => sac.getCache())
    const { updatedCacheStates } = this.userService.changePlan(user, newPlan, currentSACStates)

    const fails: Fail[] = []
    for (const state of updatedCacheStates) {
      await this.steamAccountClientStateCacheRepository.save(state)
      const [error] = await this.restoreAccountSessionUseCase.execute({
        plan: newPlan,
        sac: userSacList.find(sac => sac.accountName === state.accountName)!,
        username: user.username,
        state,
      })
      switch (error?.code) {
        case "KNOWN-ERROR":
        case "OTHER-SESSION-STILL-ON":
        case "[RestoreAccountSessionUseCase]::PLAN-NOT-FOUND":
        case "[RestoreAccountSessionUseCase]::[FarmInfinityService]:ACCOUNT-ALREADY-FARMING":
        case "[FarmUsageService]:PLAN-MAX-USAGE-EXCEEDED":
          continue
        case "cluster.farmWithAccount()::UNKNOWN-CLIENT-ERROR":
        case "[RestoreAccountSessionUseCase]::SAC-NOT-FOUND":
        case "[RestoreAccountSessionUseCase]::UNKNOWN-CLIENT-ERROR":
        case "UNKNOWN-APPLICATION-ERROR":
        case "UNKNOWN-CLIENT-ERROR":
          fails.push(error)
          continue
        default:
          error satisfies null
      }
      // if (error && error?.code !== "[RestoreAccountSessionUseCase]::SAC-NOT-LOGGED") fails.push(error)
    }

    if (fails.length) {
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
