import type { UserSACsFarmingCluster, UsersSACsFarmingClusterStorage } from "~/application/services"
import { bad, nice } from "./helpers"

export const isAccountFarmingOnCluster = (accountName: string, cluster: UserSACsFarmingCluster) => {
  return cluster.isAccountFarmingOnService(accountName)
}

/**
 * get if account is farming based
 * on given username
 */
export function isAccountFarmingOnClusterByUsername(
  usersClusterStorage: UsersSACsFarmingClusterStorage,
  username: string
) {
  return (accountName: string) => {
    const [errorGettingCluster, cluster] = usersClusterStorage.get(username)
    if (errorGettingCluster) return bad(errorGettingCluster)
    return nice(isAccountFarmingOnCluster(accountName, cluster))
  }
}
