import { PlanInfinity, PlanUsage } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"

export class FarmGamesUseCase {
  constructor(private readonly usersClusterStorage: UsersSACsFarmingClusterStorage) {}

  async execute({ username, plan, accountName, sac, gamesId, planId }: FarmGamesUseCaseProps) {
    const userCluster = this.usersClusterStorage.getOrAdd(username, plan)
    if (!userCluster.hasSteamAccountClient(accountName) && !userCluster.isAccountFarming(accountName)) {
      userCluster.addSAC(sac)
    }
    await userCluster.farmWithAccount(accountName, gamesId, planId)
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
