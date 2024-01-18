import { ApplicationError, DataOrError, PlanInfinity, PlanUsage } from "core"
import { UserSACsFarmingCluster } from "~/application/services"
import { UserClusterBuilder } from "~/utils/builders/UserClusterBuilder"

type Username = string

export class UsersSACsFarmingClusterStorage {
  usersCluster: Map<Username, UserSACsFarmingCluster> = new Map()

  constructor(private readonly userClusterBuilder: UserClusterBuilder) {}

  stopAll(killSession: boolean) {
    for (const [_, userCluster] of this.usersCluster) {
      userCluster.stopFarmAllAccounts({ killSession })
    }
  }

  get(username: string): DataOrError<UserSACsFarmingCluster> {
    const foundUserCluster = this.usersCluster.get(username)
    if (!foundUserCluster)
      return [new ApplicationError(`Nenhum cluster encontrado para o usuário [${username}].`)]
    return [null, foundUserCluster]
  }

  getOrThrow(username: string) {
    const foundUserCluster = this.usersCluster.get(username)
    if (!foundUserCluster)
      throw new ApplicationError(`Nenhum user cluster encontrado para o usuário: ${username}.`)
    return foundUserCluster
  }

  // add(username: string, userCluster: UserSACsFarmingCluster) {
  add(username: string, plan: PlanUsage | PlanInfinity): UserSACsFarmingCluster {
    // this.usersCluster.set(username, userCluster)
    const userCluster = this.userClusterBuilder.create(username, plan)
    this.usersCluster.set(username, userCluster)
    return userCluster
  }

  getAccountsStatus() {
    let accountStatus: any = {}
    for (const [username, userCluster] of this.usersCluster) {
      accountStatus[username] = userCluster.getAccountsStatus()
    }
    return accountStatus
  }

  getOrAdd(username: string, plan: PlanUsage | PlanInfinity): UserSACsFarmingCluster {
    const [notFound, userCluster] = this.get(username)
    if (notFound) {
      const newUserCluster = this.userClusterBuilder.create(username, plan)
      this.usersCluster.set(username, newUserCluster)
      return newUserCluster
    }
    return userCluster
  }
}
