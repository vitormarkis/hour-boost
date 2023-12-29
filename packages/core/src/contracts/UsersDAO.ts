import { UserSession } from "../presenters/user-presenter"
import { ISteamAccountSession } from "../io/common"

export interface UsersDAO {
  getUsersSteamAccounts(userId: string): Promise<ISteamAccountSession[]>
  getByID(userId: string): Promise<UserSession | null>
  getUsername(userId: string): Promise<{ username: string } | null>
  getPlanId(userId: string): Promise<string | null>
}
