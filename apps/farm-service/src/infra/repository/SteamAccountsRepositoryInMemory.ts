import { SteamAccount, SteamAccountsRepository } from "core"
import { SteamAccountsInMemory } from "~/infra/repository/SteamAccountsInMemory"
import { UsersInMemory } from "~/infra/repository/UsersInMemory"

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
