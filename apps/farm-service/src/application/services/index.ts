import { PlanType } from "core"

export * from "./AllUsersClientsStorage"
export * from "./FarmInfinityService"
export * from "./FarmUsageService"
export * from "./FarmingUsersStorage"
export * from "./UserClientsStorage"
export * from "./event-emitter"
export * from "./UserSACsFarmingCluster"
export * from "./UsersSACsFarmingClusterStorage"

export type FarmServiceStatus = "FARMING" | "IDDLE"

export interface IFarmService {
  type: PlanType
  status: FarmServiceStatus
  ownerId: string
  startFarm(): void
  stopFarm(): void
  hasAccountsFarming(): boolean
  farmWithAccount(accountName: string): void
  pauseFarmOnAccount(accountName: string): void
}

export type FarmStatusCount = {
  FARMING: number
  IDDLE: number
}
