import { PlanName } from "../entity/plan/Plan"
import { RoleName } from "../entity/role/Role"
import { StatusName } from "../entity/status/Status"

export interface UserSession {
  id_user: string
  email: string
  username: string
  profilePic: string
  steamAccounts: string[]
  plan: PlanName
  role: RoleName
  status: StatusName
  purchases: string[]
}
