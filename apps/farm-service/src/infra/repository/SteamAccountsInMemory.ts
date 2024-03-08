import type { SteamAccount } from "core"

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
      console.log({
        steamAccountId,
        accountsInMemory: this.steamAccounts.map(sa => ({
          accountName: sa.credentials.accountName,
          id: sa.id_steamAccount,
        })),
      })
      throw new Error("NTSH: getById() tried to find account id but was not able to.")
    }
    return foundSteamAccount
  }

  private count = 0

  addIfDontExists(steamAccounts: SteamAccount[]) {
    console.log(
      `[${this.count}] cc:x accounts `,
      this.steamAccounts.map(sa => sa.credentials.accountName)
    )
    for (const sa of steamAccounts) {
      if (this.accountNamesInDB.includes(sa.credentials.accountName)) continue
      console.log(`[${this.count}] cc:x pushing ${sa.credentials.accountName}`)
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
        console.log({
          removedSteamAccount,
          accountsInMemory: this.steamAccounts.map(sa => ({
            accountName: sa.credentials.accountName,
            id: sa.id_steamAccount,
          })),
        })
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
