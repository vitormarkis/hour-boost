import { PlanType } from "core"

export * from "./AllUsersClientsStorage"
export * from "./FarmInfinityService"
export * from "./FarmUsageService"
export * from "./FarmingUsersStorage"
export * from "./UserClientsStorage"

export type FarmServiceStatus = "FARMING" | "IDDLE"

export interface IFarmService {
	type: PlanType
	status: FarmServiceStatus
	username: string
	ownerId: string
	startFarm(): void
	stopFarm(): void
}

export type FarmStatusCount = {
	FARMING: number
	IDDLE: number
}
