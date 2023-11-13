import { FarmStatusCount, IFarmService } from "~/application/services"

export class FarmingUsersStorage implements IFarmingUsersStorage {
  users: Map<string, IFarmService> = new Map()

  add(userFarm: IFarmService): IFarmService {
    const existingUser = this.get(userFarm.username)
    if (existingUser) return existingUser
    this.users.set(userFarm.username, userFarm)
    return userFarm
  }

  get(username: string): IFarmService | null {
    return this.users.get(username) ?? null
  }

  remove(username: string): void {
    if (!this.get(username)) throw new Error("User is not farming.")
    this.users.delete(username)
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
      IDDLE,
    }
  }
}

export interface IFarmingUsersStorage {
  add(userFarm: IFarmService): IFarmService
  get(username: string): IFarmService | null
  remove(username: string): void
  listFarmingStatusCount(): FarmStatusCount
}
