import { PlanInfinity, PlanUsage } from "core/entity"
import { UserSession, UserSessionShallow } from "../presenters/user-presenter"
import { UserAdminPanelSession } from ".."

export interface UsersDAO {
  getUsersSteamAccounts(userId: string): Promise<DatabaseSteamAccount[]>
  getByID(userId: string): Promise<UserSession | null>
  getByIDShallow(userId: string): Promise<UserSessionShallow | null>
  getUsername(userId: string): Promise<{ username: string } | null>
  getPlanId(userId: string): Promise<string | null>
  getUserInfoById(
    userId: string
  ): Promise<{ username: string; userId: string; plan: PlanUsage | PlanInfinity } | null>
  getUsersAdminList(): Promise<UserAdminPanelSession[]>
}

export namespace NSUsersDAO {
  export type GetByIdFilter = Partial<{
    plan: Partial<{
      id_plan: boolean
    }>
    username: boolean
  }>
}

export interface DatabaseSteamAccount {
  id_steamAccount: string
  accountName: string
  userId: string
}
