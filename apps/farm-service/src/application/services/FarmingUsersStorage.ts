import { PlanType, UserIsAlreadyFarmingException, UserIsNotFarmingException } from "core"
import { FarmServiceStatus, FarmStatusCount, IFarmService } from "~/application/services"

export class FarmingUsersStorage implements IFarmingUsersStorage {
  users: Map<string, IFarmService> = new Map()
  usersHistory: Set<string> = new Set()

  constructor() {}

  add(userFarm: IFarmService): IFarmService {
    this.users.set(userFarm.username, userFarm)
    this.usersHistory.add(userFarm.username)
    return userFarm
  }

  get(username: string): PublicUserFarmService | null {
    const farmingUser = this.users.get(username)
    return farmingUser
      ? {
          ownerId: farmingUser.ownerId,
          status: farmingUser.status,
          type: farmingUser.type,
          username: farmingUser.username,
        }
      : null
  }

  remove(username: string): { stopFarm: () => void } {
    const farmingUser = this.users.get(username)
    if (!farmingUser) throw new UserIsNotFarmingException()
    this.users.delete(username)
    return { stopFarm: () => farmingUser.stopFarm() }
  }

  listFarmingStatusCount(): FarmStatusCount {
    let FARMING = 0
    let IDDLE = 0
    this.users.forEach(u => {
      if (u.status === "FARMING") FARMING++
      if (u.status === "IDDLE") IDDLE++
    })
    return {
      FARMING,
      IDDLE: this.usersHistory.size - FARMING,
    }
  }
}

export type PublicUserFarmService = {
  type: PlanType
  status: FarmServiceStatus
  username: string
  ownerId: string
}

export interface IFarmingUsersStorage {
  users: Map<string, IFarmService>
  add(userFarm: IFarmService): IFarmService
  remove(username: string): {
    stopFarm: () => void
  }
  listFarmingStatusCount(): FarmStatusCount
}
