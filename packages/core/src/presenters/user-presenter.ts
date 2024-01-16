import { PlanInfinityName, PlanUsageName } from "../entity/plan/Plan"
import { RoleName } from "../entity/role/Role"
import { StatusName } from "../entity/status/Status"

export interface UserSession extends UserSessionApp, UserSessionAuth {}

export interface UserSessionAuth {
  id: string
  email: string
  username: string
  profilePic: string
}

export interface UserSessionApp {
  steamAccounts: SteamAccountSession[]
  plan: PlanUsageSession | PlanInfinitySession
  role: RoleName
  status: StatusName
  purchases: string[]
}

export type GameWithAccountName = {
  accountName: string
  games: GameSession[]
}

export interface SteamAccountSession extends Persona {
  id_steamAccount: string
  accountName: string
  games: GameSession[] | null
  farmingGames: number[]
  farmStartedAt: Date | null
  farmedTimeInSeconds: number
}

export interface PersonaWithAccountName extends Persona {
  accountName: string
}

export interface Persona {
  profilePictureUrl: string | null
}

export interface GameSession {
  id: number
  imageUrl: string
  name: string
}

export interface PlanSession {
  maxSteamAccounts: number
  maxGamesAllowed: number
  autoRestarter: boolean
}

export interface PlanUsageSession extends PlanSession {
  type: "USAGE"
  name: PlanUsageName
  maxUsageTime: number
}

export interface PlanInfinitySession extends PlanSession {
  type: "INFINITY"
  name: PlanInfinityName
}
