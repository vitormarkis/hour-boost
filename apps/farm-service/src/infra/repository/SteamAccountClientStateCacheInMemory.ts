import { SACStateCache, SteamAccountClientStateCacheRepository } from "core"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly cache: Map<string, SACStateCache> = new Map()

  async get(keyUserAccountName: string): Promise<SACStateCache | null> {
    return this.cache.get(keyUserAccountName) ?? null
  }

  async set(keyUserAccountName: string, sacStateCache: SACStateCache): Promise<void> {
    this.cache.set(keyUserAccountName, sacStateCache)
  }
}
