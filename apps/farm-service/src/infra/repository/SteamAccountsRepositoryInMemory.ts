import type { SteamAccount, SteamAccountsRepository } from "core"
import type { SteamAccountsInMemory } from "~/infra/repository/SteamAccountsInMemory"
import type { UsersInMemory } from "~/infra/repository/UsersInMemory"

export class SteamAccountsRepositoryInMemory implements SteamAccountsRepository {
  constructor(
    private readonly usersMemory: UsersInMemory,
    private readonly steamAccountsInMemory: SteamAccountsInMemory
  ) {}

  async save(steamAccount: SteamAccount): Promise<void> {
    this.steamAccountsInMemory.addOrUpdate(steamAccount)
  }

  async getByAccountName(accountName: string): Promise<SteamAccount | null> {
    return (
      this.steamAccountsInMemory.steamAccounts.find(sa => sa.credentials.accountName === accountName) ?? null
    )
  }
}
