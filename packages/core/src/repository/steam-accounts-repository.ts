import { SteamAccount } from "core/entity"

export interface SteamAccountsRepository {
  getByAccountName(accountName: string): Promise<SteamAccount | null>
}
