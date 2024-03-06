import {
  DataOrFail,
  Fail,
  GetError,
  PlanRepository,
  PlanSetters,
  SteamAccountClientStateCacheRepository,
  UsersRepository,
} from "core"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { getUserSACs_OnStorage_ByUser_UpdateStates } from "~/utils/getUser"
import { bad, nice } from "~/utils/helpers"
import { ResetFarm, makeResetFarm } from "~/utils/resetFarm"
import { EAppResults, RestoreAccountSessionUseCase } from "."
import { ChangeUserPlanToCustomUseCase } from "./ChangeUserPlanToCustomUseCase"

export class AddMoreGamesToPlanUseCase implements IAddMoreGamesToPlanUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly changeUserPlanToCustomUseCase: ChangeUserPlanToCustomUseCase,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly planRepository: PlanRepository
  ) {}

  async execute({ mutatingUserId, newMaxGamesAllowed }: AddMoreGamesToPlanUseCasePayload) {
    const resetFarm = makeResetFarm({
      allUsersClientsStorage: this.allUsersClientsStorage,
      steamAccountClientStateCacheRepository: this.steamAccountClientStateCacheRepository,
      planRepository: this.planRepository,
      usersSACsFarmingClusterStorage: this.usersSACsFarmingClusterStorage,
    })

    let user = await this.usersRepository.getByID(mutatingUserId)
    if (!user) {
      return bad(
        Fail.create(EAppResults["USER-NOT-FOUND"], 404, { givenUserId: mutatingUserId, foundUser: user })
      )
    }
    if (!user.plan.isCustom()) {
      const [error, userWithCustomPlan] = await this.changeUserPlanToCustomUseCase.execute({ user })
      if (error) return bad(error)
      user = userWithCustomPlan
    }

    setMaxGamesAllowed(newMaxGamesAllowed, user.plan as unknown as PlanSetters)
    const [error, updatedCacheStates] = getUserSACs_OnStorage_ByUser_UpdateStates(
      user,
      this.allUsersClientsStorage,
      user.plan
    )
    if (error) return bad(error)
    await this.usersRepository.update(user)

    for (const state of updatedCacheStates) {
      await this.steamAccountClientStateCacheRepository.save(state)
    }

    const errorsList: GetError<ResetFarm>[] = []
    for (const steamAccount of user.steamAccounts.data) {
      const [errorReseting] = await resetFarm({
        accountName: steamAccount.credentials.accountName,
        planId: user.plan.id_plan,
        userId: user.id_user,
        username: user.username,
        isFinalizingSession: false,
      })
      if (errorReseting) errorsList.push(errorReseting)
    }
    if (errorsList.length) return bad(Fail.create("LIST:ERROR-RESETING-FARM", 400, { errorsList }))
    return nice(user)
  }
}

export type AddMoreGamesToPlanUseCasePayload = {
  mutatingUserId: string
  newMaxGamesAllowed: number
}

interface IAddMoreGamesToPlanUseCase {
  execute(...args: any[]): Promise<DataOrFail<any>>
}

function setMaxGamesAllowed(newMaxGamesAllowed: number, planSetters: PlanSetters) {
  planSetters.setMaxGamesAllowed(newMaxGamesAllowed)
}
