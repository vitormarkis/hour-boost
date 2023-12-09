import { UserSACsFarmingCluster } from "~/application/services/UserSACsFarmingCluster";

export class UsersSACsFarmingClusterStorage {
  usersCluster: Map<string, UserSACsFarmingCluster> = new Map()

  get(username: string) {
    return this.usersCluster.get(username) ?? null
  }

  add(username: string, userCluster: UserSACsFarmingCluster) {
    this.usersCluster.set(username, userCluster)
    return userCluster
  }
}