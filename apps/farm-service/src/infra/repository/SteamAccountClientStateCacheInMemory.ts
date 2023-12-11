import { SACStateCacheDTO, SteamAccountClientStateCacheRepository } from "core"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly cache: Map<string, SACStateCacheDTO> = new Map()

  async get(keyUserAccountName: string): Promise<SACStateCacheDTO | null> {
    return this.cache.get(keyUserAccountName) ?? null
  }

  async set(keyUserAccountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO> {
    this.cache.set(keyUserAccountName, sacStateCache)
    return sacStateCache
  }
}
