import { PlanInfinityName, PlanUsageName } from "../entity/plan/Plan"
import { RoleName } from "../entity/role/Role"
import { StatusName } from "../entity/status/Status"

export interface UserSession {
  id_user: string
  email: string
  username: string
  profilePic: string
  steamAccounts: SteamAccountSession[]
  plan: PlanUsageSession | PlanInfinitySession
  role: RoleName
  status: StatusName
  purchases: string[]
}

export interface SteamAccountSession {
  id_steamAccount: string
  accountName: string
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
