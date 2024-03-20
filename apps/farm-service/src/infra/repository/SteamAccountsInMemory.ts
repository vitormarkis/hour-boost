import { type SteamAccount, makeError } from "core"

export class SteamAccountsInMemory {
  steamAccounts: SteamAccount[] = []

  get ids() {
    return this.steamAccounts.map(sa => sa.id_steamAccount)
  }

  get accountNamesInDB() {
    return this.steamAccounts.map(sa => sa.credentials.accountName)
  }

  getById(steamAccountId: string) {
    const foundSteamAccount = this.steamAccounts.find(sa => sa.id_steamAccount === steamAccountId)
    if (!foundSteamAccount) {
      throw makeError("NTSH: getById() tried to find account id but was not able to.", {
        steamAccountId,
        accountsInMemory: this.steamAccounts.map(sa => ({
          accountName: sa.credentials.accountName,
          id: sa.id_steamAccount,
        })),
      })
    }
    return foundSteamAccount
  }

  private count = 0

  addIfDontExists(steamAccounts: SteamAccount[]) {
    for (const sa of steamAccounts) {
      if (this.accountNamesInDB.includes(sa.credentials.accountName)) continue
      this.steamAccounts.push(sa)
    }
    this.count++
  }

  addOrUpdate(steamAccount: SteamAccount) {
    if (this.accountNamesInDB.includes(steamAccount.credentials.accountName)) {
      this.steamAccounts = this.steamAccounts.map(sa =>
        sa.id_steamAccount === steamAccount.id_steamAccount ? steamAccount : sa
      )
      return
    }
    this.steamAccounts.push(steamAccount)
  }

  disownSteamAccounts(ids: string[]) {
    for (const removedSteamAccount of ids) {
      const steamAccount = this.steamAccounts.find(sa => sa.id_steamAccount === removedSteamAccount)
      if (!steamAccount) {
        throw new Error("NTSH: tried to find account id but was not able to.")
      }
      console.log(`Disowing ${steamAccount?.credentials.accountName}`)
      steamAccount.disown()
      this.steamAccounts = this.steamAccounts.map(sa =>
        sa.credentials.accountName === steamAccount.credentials.accountName ? steamAccount : sa
      )
    }
  }

  disownSteamAccountsAll() {
    const ids = this.steamAccounts.map(sa => sa.id_steamAccount)
    this.disownSteamAccounts(ids)
  }
}
