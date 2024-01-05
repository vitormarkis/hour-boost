import { ApplicationError, DataOrError, PlanInfinity, PlanUsage } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"
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
  }: FarmGamesUseCaseProps): Promise<DataOrError<null>> {
    try {
      const userCluster = this.usersClusterStorage.getOrAdd(username, plan)
      if (!userCluster.hasSteamAccountClient(accountName) && !userCluster.isAccountFarming(accountName)) {
        userCluster.addSAC(sac)
      }
      return userCluster.farmWithAccount(accountName, gamesId, planId)
    } catch (error) {
      console.log({ "FarmGamesUseCase.execute.error": error })
      if (error instanceof Error) {
        return [new ApplicationError(error.message), null]
      }
      return [new ApplicationError("Erro desconhecido"), null]
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
}
