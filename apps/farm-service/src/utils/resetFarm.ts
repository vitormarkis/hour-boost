import { type CacheState, Fail, type PlanRepository, type SteamAccountClientStateCacheRepository } from "core"
import type {
  AllUsersClientsStorage,
  UserSACsFarmingCluster,
  UsersSACsFarmingClusterStorage,
} from "~/application/services"
import type { SteamAccountClient } from "~/application/services/steam"
import { StopFarmUseCase } from "~/application/use-cases/StopFarmUseCase"
import { getSACOn_AllUsersClientsStorage_ByUserId } from "~/utils/getSAC"
import { bad, nice } from "~/utils/helpers"
import { restoreSACStateOnApplication } from "~/utils/restoreSACStateOnApplication"

type MakeResetFarmProps = {
  allUsersClientsStorage: AllUsersClientsStorage
  usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage
  steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  planRepository: PlanRepository
}

type ResetFarmProps = {
  accountName: string
  planId: string
  username: string
  userId: string
  isFinalizingSession: boolean
}

export function makeResetFarm({
  allUsersClientsStorage,
  steamAccountClientStateCacheRepository,
  planRepository,
  usersSACsFarmingClusterStorage,
}: MakeResetFarmProps) {
  return async ({ accountName, planId, userId, username, isFinalizingSession }: ResetFarmProps) => {
    const state = await steamAccountClientStateCacheRepository.get(accountName)
    if (!state) return bad(Fail.create("NO_CACHE_STATE_FOUND", 404))

    const [errorGettingSAC, sac] = getSACOn_AllUsersClientsStorage_ByUserId(
      userId,
      allUsersClientsStorage
    )(accountName)
    if (errorGettingSAC) return bad(errorGettingSAC)

    const [errorFindingCluster, userCluster] = usersSACsFarmingClusterStorage.get(username)
    if (errorFindingCluster) return bad(errorFindingCluster)

    const stopFarmUseCase = new StopFarmUseCase(usersSACsFarmingClusterStorage, planRepository)
    const result = await resetFarm(stopFarmUseCase)({
      accountName,
      planId,
      sac,
      state,
      userCluster,
      username,
      isFinalizingSession,
    })
    return result
  }
}

type ResetFarmProps2 = {
  sac: SteamAccountClient
  userCluster: UserSACsFarmingCluster
  state: CacheState
  accountName: string
  planId: string
  username: string
  isFinalizingSession: boolean
}

export function resetFarm(stopFarmUseCase: StopFarmUseCase) {
  return async ({
    state,
    userCluster,
    sac,
    accountName,
    planId,
    username,
    isFinalizingSession,
  }: ResetFarmProps2) => {
    const [error] = await stopFarmUseCase.execute({
      accountName,
      planId,
      username,
      isFinalizingSession,
    })
    if (error) {
      switch (error.code) {
        case "PAUSE-FARM-ON-ACCOUNT-NOT-FOUND":
        case "TRIED-TO-STOP-FARM-ON-NON-FARMING-ACCOUNT":
        case "DO-NOT-HAVE-ACCOUNTS-FARMING":
          break
        case "PLAN-NOT-FOUND":
        case "[Users-Cluster-Storage]:CLUSTER-NOT-FOUND":
          return bad(error)
        default:
          error satisfies never
      }
    }

    const [errorRestoringSACState] = await restoreSACStateOnApplication(userCluster)(sac, state)
    if (errorRestoringSACState) return bad(errorRestoringSACState)
    return nice()
  }
}

export type ResetFarm = ReturnType<typeof makeResetFarm>
