import { DataOrFail, Fail, PlanInfinity, PlanUsage, SACStateCache } from "core"
import { UserSACsFarmingCluster } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { FailGeneric } from "~/types/EventsApp.types"
import { SACStateCacheBuilder } from "~/utils/builders/SACStateCacheBuilder"
import { bad, nice } from "~/utils/helpers"

export class StagingGamesListService implements IStagingGamesListService {
  private readonly codify = <const T extends string = string>(moduleCode: T) =>
    `[Staging-Games-List-Service]:${moduleCode}` as const

  constructor(private readonly sacStateCacheBuilder: SACStateCacheBuilder) {}

  async update({ plan, userCluster, newGameList, sac }: StagingGamesListServicePayload) {
    if (newGameList.length > plan.maxGamesAllowed) {
      const fail = new Fail({
        code: this.codify("STAGE-MORE-GAMES-THAN-PLAN-ALLOWS"),
        httpStatus: 403,
        payload: {
          maxAllowed: plan.maxGamesAllowed,
          newGameList,
        },
      })
      return bad(fail)
    }

    const stateFarmService = userCluster.getInnerState()
    const stateSAC = sac.getInnerState()
    const sacStateCache = this.sacStateCacheBuilder.create({ ...stateSAC, ...stateFarmService })
    sac.updateStagingGames(newGameList)
    sacStateCache.updateStagingGames(newGameList)
    return nice(sacStateCache)
  }
}

export type StagingGamesListServicePayload = {
  newGameList: number[]
  plan: PlanUsage | PlanInfinity
  userCluster: UserSACsFarmingCluster
  sac: SteamAccountClient
}

interface IStagingGamesListService {
  update(...args: any[]): Promise<DataOrFail<FailGeneric, SACStateCache>>
}
