import {
  AccountSteamGameDTO,
  AccountSteamGamesList,
  IRefreshToken,
  InitProps,
  SACStateCacheDTO,
  SteamAccountClientStateCacheRepository,
} from "core"
import { Redis } from "ioredis"
import { Logger } from "~/utils/Logger"

export class SteamAccountClientStateCacheRedis implements SteamAccountClientStateCacheRepository {
  readonly logger: Logger
  readonly STATE_KEY = (accountName: string) => accountName + ":state"
  readonly REFRESH_TOKENS_KEY = "*:refreshToken"
  readonly REFRESH_TOKEN_KEY = (accountName: string) => accountName + ":refreshToken"

  constructor(private readonly redis: Redis) {
    this.logger = new Logger(`State Redis`)
  }

  async init({ accountName, planId, username }: InitProps): Promise<void> {
    this.logger.log(`init() called! for ${accountName}`)
    const key = this.STATE_KEY(accountName)
    const hasState = await this.redis.call("JSON.TYPE", key)
    if (!hasState) {
      this.logger.log(`account don't have state, initting ${accountName}`)
      await this.set(accountName, {
        accountName,
        gamesPlaying: [],
        isFarming: false,
        planId,
        username,
      })
      return
    }
    this.logger.log(`state found, not initting ${accountName}`)
  }
  async setRefreshToken(accountName: string, refreshToken: IRefreshToken): Promise<void> {
    this.logger.log(`set refresh token for ${accountName}`)
    await this.redis.set(this.REFRESH_TOKEN_KEY(accountName), JSON.stringify(refreshToken))
  }
  async getRefreshToken(accountName: string): Promise<IRefreshToken | null> {
    this.logger.log(`getting refresh token for ${accountName}`)
    const foundRefreshToken = await this.redis.get(this.REFRESH_TOKEN_KEY(accountName))
    if (!foundRefreshToken) return null
    const refreshToken = JSON.parse(foundRefreshToken) as IRefreshToken
    return refreshToken ?? null
  }

  getUsersRefreshToken(): Promise<string[]> {
    return this.redis.keys(this.REFRESH_TOKENS_KEY)
  }

  async setPlayingGames(
    accountName: string,
    gamesId: number[],
    planId: string,
    username: string
  ): Promise<void> {
    const key = this.STATE_KEY(accountName)
    const hasState = await this.redis.call("JSON.TYPE", key)
    if (!hasState)
      await this.init({
        accountName,
        planId,
        username,
      })
    const value = JSON.stringify(gamesId)
    this.logger.log(`${accountName} set playing games on cache: ${gamesId.join(", ")}.`)
    await this.redis
      .multi()
      .call("JSON.SET", key, "$.gamesPlaying", value)
      .call("JSON.SET", key, "$.isFarming", "true")
      .exec()
  }

  async getAccountGames(accountName: string): Promise<AccountSteamGamesList | null> {
    const foundGames = await this.redis.get(`${accountName}:games`)
    if (!foundGames) {
      this.logger.log(`no games found for ${accountName}`)
      return null
    }
    const games = JSON.parse(foundGames) as AccountSteamGameDTO[]
    const accountSteamGamesList = new AccountSteamGamesList(games)
    this.logger.log(`found games for ${accountName}: ${games.map(g => g.id).join(", ")}.`)
    return accountSteamGamesList
  }

  async setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void> {
    this.logger.log(`setting games for ${accountName}`)
    await this.redis.set(`${accountName}:games`, JSON.stringify(games.toJSON()))
  }

  async get(accountName: string): Promise<SACStateCacheDTO | null> {
    const key = this.STATE_KEY(accountName)
    const foundState = (await this.redis.call("JSON.GET", key, "$")) as string | null
    this.logger.log(`State found for ${key}, `, foundState)
    if (!foundState) {
      this.logger.log(`state found for user ${accountName}`)
      return null
    }
    const [state] = JSON.parse(foundState) as [state: SACStateCacheDTO]
    const { gamesPlaying, isFarming, planId, username } = state
    this.logger.log(`no state found for user ${accountName}`)
    return Promise.resolve({
      accountName,
      gamesPlaying,
      isFarming,
      planId,
      username,
    })
    // if (error.message.includes("new objects must be created at the root")) {
  }

  async set(accountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO> {
    const value = JSON.stringify(sacStateCache)
    const key = this.STATE_KEY(accountName)
    this.logger.log(`setting state for ${accountName}`)
    await this.redis.call("JSON.SET", key, "$", value)
    return sacStateCache
  }

  async delete(accountName: string): Promise<void> {
    this.logger.log(`invalidating cache for user ${accountName}`)
    await this.redis.del(accountName)
  }

  async flushAll(): Promise<void> {
    this.logger.log(`deleting all entries for in cache.`)
    await this.redis.flushall()
  }
}
