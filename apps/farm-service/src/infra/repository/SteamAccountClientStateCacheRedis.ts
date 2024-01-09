import {
  AccountSteamGamesList,
  GameSession,
  IRefreshToken,
  InitProps,
  SACStateCacheDTO,
  SteamAccountClientStateCacheRepository,
  SteamAccountPersonaState,
} from "core"
import { Redis } from "ioredis"
import { Logger } from "~/utils/Logger"

export class SteamAccountClientStateCacheRedis implements SteamAccountClientStateCacheRepository {
  readonly logger: Logger
  readonly KEY_STATE = (accountName: string) => accountName + ":state"
  readonly KEY_REFRESH_TOKEN_LIST = "*:refreshToken"
  readonly KEY_REFRESH_TOKEN = (accountName: string) => accountName + ":refreshToken"
  readonly KEY_ACCOUNT_GAMES = (accountName: string) => accountName + ":sac:games"
  readonly KEY_ACCOUNT_PERSONA = (accountName: string) => accountName + ":sac:persona"

  constructor(private readonly redis: Redis) {
    this.logger = new Logger(`State Redis`)
  }

  async deleteAllEntriesFromAccount(accountName: string): Promise<void> {
    this.logger.log(`Deleting all entries for [${accountName}].`)
    await this.redis
      .multi()
      .call("JSON.DEL", this.KEY_STATE(accountName))
      .del(this.KEY_REFRESH_TOKEN(accountName))
      .exec()
  }

  async stopFarm(accountName: string): Promise<void> {
    const key = this.KEY_STATE(accountName)
    await this.redis
      .multi()
      .call("JSON.SET", key, "$.gamesPlaying", "[]")
      .call("JSON.SET", key, "$.isFarming", "false")
      .exec()
  }

  async getPersona(accountName: string): Promise<SteamAccountPersonaState | null> {
    const key = this.KEY_ACCOUNT_PERSONA(accountName)
    const foundState = (await this.redis.call("JSON.GET", key, "$")) as string | null
    if (!foundState) return null
    const [persona] = JSON.parse(foundState) as [persona: SteamAccountPersonaState]
    return persona
  }

  async setPersona(accountName: string, persona: SteamAccountPersonaState): Promise<void> {
    const value = JSON.stringify(persona)
    const key = this.KEY_ACCOUNT_PERSONA(accountName)
    await this.redis.call("JSON.SET", key, "$", value)
  }

  async init({ accountName, planId, username }: InitProps): Promise<void> {
    this.logger.log(`init() called! for ${accountName}`)
    const key = this.KEY_STATE(accountName)
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
    await this.redis.set(this.KEY_REFRESH_TOKEN(accountName), JSON.stringify(refreshToken))
  }
  async getRefreshToken(accountName: string): Promise<IRefreshToken | null> {
    this.logger.log(`getting refresh token for ${accountName}`)
    const foundRefreshToken = await this.redis.get(this.KEY_REFRESH_TOKEN(accountName))
    if (!foundRefreshToken) return null
    const refreshToken = JSON.parse(foundRefreshToken) as IRefreshToken
    return refreshToken ?? null
  }

  getUsersRefreshToken(): Promise<string[]> {
    return this.redis.keys(this.KEY_REFRESH_TOKEN_LIST)
  }

  async setPlayingGames(
    accountName: string,
    gamesId: number[],
    planId: string,
    username: string
  ): Promise<void> {
    const key = this.KEY_STATE(accountName)
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
    const key = this.KEY_ACCOUNT_GAMES(accountName)
    const foundGames = await this.redis.get(key)
    if (!foundGames) {
      this.logger.log(`no games found for ${accountName}`)
      return null
    }
    const games = JSON.parse(foundGames) as GameSession[]
    const accountSteamGamesList = new AccountSteamGamesList(games)
    this.logger.log(`found games for ${accountName}: ${games.map(g => g.id).join(", ")}.`)
    return accountSteamGamesList
  }

  async setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void> {
    const key = this.KEY_ACCOUNT_GAMES(accountName)
    this.logger.log(`setting games for ${accountName}`)
    await this.redis.set(key, JSON.stringify(games.toJSON()))
  }

  async get(accountName: string): Promise<SACStateCacheDTO | null> {
    const key = this.KEY_STATE(accountName)
    const foundState = (await this.redis.call("JSON.GET", key, "$")) as string | null
    if (!foundState) {
      this.logger.log(`state NOT found for user ${accountName}`)
      return null
    }
    this.logger.log(`state found for user ${accountName}`)
    const [state] = JSON.parse(foundState) as [state: SACStateCacheDTO]
    this.logger.log(`no state found for user ${accountName}`)
    return Promise.resolve(state)
  }

  async set(accountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO> {
    const value = JSON.stringify(sacStateCache)
    const key = this.KEY_STATE(accountName)
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
