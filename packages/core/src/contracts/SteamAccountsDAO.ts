export interface SteamAccountsDAO {
  getAutoRestartInfo(accountName: string): Promise<boolean | null>
  listAccountNames(options?: {
    filter?: {
      onlyOwnedAccounts: boolean
    }
  }): Promise<string[]>
}
