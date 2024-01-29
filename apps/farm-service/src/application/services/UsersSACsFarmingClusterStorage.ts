import { ApplicationError, DataOrError, DataOrFail, Fail, PlanInfinity, PlanUsage } from "core"
import { UserSACsFarmingCluster } from "~/application/services"
import { EAppResults } from "~/application/use-cases"
import { FailGeneric } from "~/types/EventsApp.types"
import { UserClusterBuilder } from "~/utils/builders/UserClusterBuilder"
import { bad, nice } from "~/utils/helpers"

type Username = string

interface IUsersSACsFarmingClusterStorage {
  get(username: string): DataOrFail<FailGeneric, UserSACsFarmingCluster>
}

export class UsersSACsFarmingClusterStorage implements IUsersSACsFarmingClusterStorage {
  private readonly codify = <const T extends string = string>(moduleCode: T) =>
    `[Users-Cluster-Storage]:${moduleCode}` as const
  usersCluster: Map<Username, UserSACsFarmingCluster> = new Map()

  constructor(private readonly userClusterBuilder: UserClusterBuilder) {}

  stopAll(killSession: boolean) {
    for (const [_, userCluster] of this.usersCluster) {
      userCluster.stopFarmAllAccounts({ killSession })
    }
  }

  get(username: string) {
    const foundUserCluster = this.usersCluster.get(username)
    if (foundUserCluster) return nice(foundUserCluster)
    return bad(
      new Fail({
        code: this.codify(EAppResults["CLUSTER-NOT-FOUND"]),
        httpStatus: 404,
        payload: {
          givenUsername: username,
          clusters: Array.from(this.usersCluster.keys()),
        },
      })
    )
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
