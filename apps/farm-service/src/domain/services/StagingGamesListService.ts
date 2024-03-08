import { type DataOrFail, Fail, type PlanInfinity, type PlanUsage } from "core"
import type { SteamAccountClient } from "~/application/services/steam"
import type { FailGeneric } from "~/types/EventsApp.types"
import { bad, nice } from "~/utils/helpers"

export class StagingGamesListService implements IStagingGamesListService {
  private readonly codify = <const T extends string = string>(moduleCode: T) =>
    `[Staging-Games-List-Service]:${moduleCode}` as const

  constructor() {}

  async update({ plan, newGameList, sac }: StagingGamesListServicePayload) {
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

    sac.updateStagingGames(newGameList)
    return nice()
  }
}

export type StagingGamesListServicePayload = {
  newGameList: number[]
  plan: PlanUsage | PlanInfinity
  sac: SteamAccountClient
}

interface IStagingGamesListService {
  update(...args: any[]): Promise<DataOrFail<FailGeneric>>
}
