import { DataOrFail, Fail, PlanInfinity, PlanUsage, SACStateCache } from "core"
import { UserSACsFarmingCluster } from "~/application/services"
import { FailGeneric } from "~/types/EventsApp.types"
import { bad, nice } from "~/utils/helpers"

export type StagingGamesListServicePayload = {
  newGameList: number[]
  plan: PlanUsage | PlanInfinity
  userCluster: UserSACsFarmingCluster
  accountName: string
}

interface IStagingGamesListService {
  update(...args: any[]): Promise<DataOrFail<FailGeneric, SACStateCache>>
}

export class StagingGamesListService implements IStagingGamesListService {
  constructor() {}

  async update({ plan, userCluster, newGameList, accountName }: StagingGamesListServicePayload) {
    if (newGameList.length > plan.maxGamesAllowed) {
      const fail = new Fail({
        code: "STAGE-MORE-GAMES-THAN-PLAN-ALLOWS",
        httpStatus: 403,
        payload: {
          maxAllowed: plan.maxGamesAllowed,
          newGameList,
        },
      })
      return bad(fail)
    }

    const [errorUpdatingStagingGames, result] = userCluster.updateStagingGames(accountName, newGameList)
    if (errorUpdatingStagingGames) return bad(errorUpdatingStagingGames)
    const sacStateCache = result.getStateCache()

    return nice(sacStateCache)
  }
}
