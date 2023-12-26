import { SACStateCacheDTO, SteamAccountClientStateCacheRepository } from "core"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly cache: Map<string, SACStateCacheDTO> = new Map()

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
