import { AccountSteamGamesList, SACStateCacheDTO, SteamAccountClientStateCacheRepository } from "core"
import { Redis } from "ioredis"

export class SteamAccountClientStateCacheRedis implements SteamAccountClientStateCacheRepository {
  constructor(private readonly redis: Redis) {}
  getAccountGames(accountName: string): Promise<AccountSteamGamesList | null> {
    throw new Error("Method not implemented.")
  }
  setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void> {
    throw new Error("Method not implemented.")
  }

  async get(keyUserAccountName: string): Promise<SACStateCacheDTO | null> {
    try {
      const foundStateString = await this.redis.get(keyUserAccountName)
      if (!foundStateString) return null
      const foundState = JSON.parse(foundStateString)
      // this.redis.disconnect()
      return {
        accountName: foundState.accountName,
        gamesPlaying: foundState.gamesPlaying,
        isFarming: foundState.isFarming,
      } as SACStateCacheDTO
    } catch (error) {
      console.log("[!!Error (SteamAccountClientStateCacheRedis.get)]", error)
      return null
    }
  }

  async set(keyUserAccountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO> {
    try {
      const stateString = JSON.stringify(sacStateCache)
      console.log("[SteamAccountClientStateCacheRedis saving]: ", { stateString })
      console.log({
        setting: {
          key: keyUserAccountName,
          value: stateString,
        },
      })
      await this.redis.set(keyUserAccountName, stateString)
      // this.redis.disconnect()
      return sacStateCache
    } catch (error) {
      console.log("[!!Error (SteamAccountClientStateCacheRedis.set)]", error)
      return sacStateCache
    }
  }

  async delete(keyUserAccountName: string): Promise<void> {
    try {
      await this.redis.del(keyUserAccountName)
      // this.redis.disconnect()
    } catch (error) {
      console.log("[!!Error (SteamAccountClientStateCacheRedis.delete)]", error)
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.redis.flushall()
      // this.redis.disconnect()
    } catch (error) {
      console.log("[!!Error (SteamAccountClientStateCacheRedis.flushAll)]", error)
    }
  }
}
