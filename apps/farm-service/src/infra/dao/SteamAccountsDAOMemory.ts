import { SteamAccountsDAO } from "core"
import { SteamAccountsInMemory } from "../repository/SteamAccountsInMemory"

export class SteamAccountsDAOMemory implements SteamAccountsDAO {
  constructor(private readonly db: SteamAccountsInMemory) {}

  async getAutoRestartInfo(accountName: string): Promise<boolean | null> {
    return this.db.steamAccounts.find(sa => sa.credentials.accountName === accountName)!.autoRelogin
  }
  async listAccountNames(
    options?: { filter?: { onlyOwnedAccounts: boolean } | undefined } | undefined
  ): Promise<string[]> {
    return this.db.steamAccounts.map(sa => sa.credentials.accountName)
  }
}
