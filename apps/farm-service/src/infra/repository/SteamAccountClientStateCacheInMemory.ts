import { AccountSteamGamesList, SACStateCacheDTO, SteamAccountClientStateCacheRepository } from "core"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly cache: Map<string, SACStateCacheDTO> = new Map()
  private readonly games: Map<string, AccountSteamGamesList> = new Map()

  async setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void> {
    this.games.set(`${accountName}:games`, games)
  }

  async getAccountGames(accountName: string): Promise<AccountSteamGamesList | null> {
    return this.games.get(`${accountName}:games`) ?? null
  }

  async get(keyUserAccountName: string): Promise<SACStateCacheDTO | null> {
    return this.cache.get(keyUserAccountName) ?? null
  }

  async delete(keyUserAccountName: string): Promise<void> {
    this.cache.delete(keyUserAccountName)
  }

  async set(keyUserAccountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO> {
    this.cache.set(keyUserAccountName, sacStateCache)
    return sacStateCache
  }

  async flushAll(): Promise<void> {
    this.cache.clear()
  }
}
