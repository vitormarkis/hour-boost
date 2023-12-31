import { UserSession } from "../presenters/user-presenter"

export interface UsersDAO {
  getUsersSteamAccounts(userId: string): Promise<DatabaseSteamAccount[]>
  getByID(userId: string): Promise<UserSession | null>
  getUsername(userId: string): Promise<{ username: string } | null>
  getPlanId(userId: string): Promise<string | null>
}

export interface DatabaseSteamAccount {
  id_steamAccount: string
  accountName: string
  userId: string
}
