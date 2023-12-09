import { SACStateCache, SteamAccountClientStateCacheRepository } from "core";

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly cache: Map<string, SACStateCache> = new Map()

  constructor(
  ) {

  }

  async getByAccountName(accountName: string): Promise<SACStateCache | null> {
    return this.cache.get(accountName) ?? null
  }

  async set(accountName: string, sacStateCache: SACStateCache): Promise<void> {
    this.cache.set(accountName, sacStateCache)
  }
}