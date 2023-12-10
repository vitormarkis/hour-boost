import { UserSACsFarmingCluster } from "~/application/services"

export class UsersSACsFarmingClusterStorage {
  usersCluster: Map<string, UserSACsFarmingCluster> = new Map()

  get(username: string) {
    return this.usersCluster.get(username) ?? null
  }

  add(username: string, userCluster: UserSACsFarmingCluster) {
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
}
