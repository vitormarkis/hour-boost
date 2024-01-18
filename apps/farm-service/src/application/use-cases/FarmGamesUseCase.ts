import { ApplicationError, DataOrError, PlanInfinity, PlanUsage } from "core"
import { NSUserCluster, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"

export class FarmGamesUseCase {
  constructor(private readonly usersClusterStorage: UsersSACsFarmingClusterStorage) {}

  async execute({
    username,
    plan,
    accountName,
    sac,
    gamesId,
    planId,
    sessionType,
  }: FarmGamesUseCaseProps): Promise<DataOrError<null>> {
    try {
      // const userCluster = this.usersClusterStorage.getOrAdd(username, plan)
      const [error, userCluster] = this.usersClusterStorage.get(username)
      if (error) return [error]
      const isAccountFarming = userCluster.isAccountFarming(accountName)
      if (!userCluster.hasSteamAccountClient(accountName) && !isAccountFarming) {
        userCluster.addSAC(sac)
      }
      return userCluster.farmWithAccount({
        accountName,
        gamesId,
        planId,
        sessionType,
      })
    } catch (error) {
      console.log({ "FarmGamesUseCase.execute.error": error })
      if (error instanceof Error) {
        return [new ApplicationError(error.message)]
      }
      return [new ApplicationError("Erro desconhecido")]
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
  sessionType: NSUserCluster.SessionType
}
