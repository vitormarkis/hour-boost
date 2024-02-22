import { ApplicationError, DataOrFail, Fail, PlanInfinity, PlanUsage } from "core"
import { NSUserCluster, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { EAppResults } from "~/application/use-cases/RestoreAccountSessionUseCase"
import { bad, nice } from "~/utils/helpers"

abstract class IFarmGamesUseCase {
  abstract execute(...args: any[]): Promise<DataOrFail<Fail>>
}

export class FarmGamesUseCase extends IFarmGamesUseCase {
  constructor(private readonly usersClusterStorage: UsersSACsFarmingClusterStorage) {
    super()
  }

  async execute({ username, plan, accountName, sac, gamesId, planId, session }: FarmGamesUseCaseProps) {
    try {
      // const userCluster = this.usersClusterStorage.getOrAdd(username, plan)
      const [error, userCluster] = this.usersClusterStorage.get(username)
      if (error) return bad(error)
      const isAccountFarming = userCluster.isAccountFarmingOnService(accountName)
      if (!userCluster.hasSteamAccountClient(accountName) && !isAccountFarming) {
        userCluster.addSAC(sac)
      }
      const [errorFarmingWithAccount, result] = await userCluster.farmWithAccount({
        accountName,
        gamesId,
        planId,
        session,
      })
      if (errorFarmingWithAccount) return bad(errorFarmingWithAccount)
      return nice(result)
    } catch (error) {
      console.log({ "FarmGamesUseCase.execute.error": error })
      return bad(
        new Fail({
          code: EAppResults["UNKNOWN-ERROR"],
          payload: error as Error,
          httpStatus: 400,
        })
      )
    }
  }
}

type FarmGamesUseCaseProps = {
  username: string
  plan: PlanUsage | PlanInfinity
  accountName: string
  sac: SteamAccountClient
  gamesId: number[]
  planId: string
  session: NSUserCluster.SessionType
}
