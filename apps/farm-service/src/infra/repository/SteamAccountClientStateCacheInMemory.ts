import {
  AccountSteamGamesList,
  IRefreshToken,
  InitProps,
  NSSteamAccountClientStateCacheRepository,
  SACStateCache,
  SACStateCacheDTO,
  SteamAccountClientStateCacheRepository,
  SteamAccountPersonaState,
} from "core"
import { Logger } from "~/utils/Logger"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly state: Map<string, SACStateCacheDTO> = new Map()
  private readonly games: Map<string, AccountSteamGamesList> = new Map()
  private readonly refreshTokens: Map<string, IRefreshToken> = new Map()
  private readonly personas: Map<string, SteamAccountPersonaState> = new Map()
  private readonly logger = new Logger("sac-cache-in-memory")

  async setStagingGames(accountName: string, gamesId: number[]): Promise<void> {
    throw new Error("Method not implemented.")
  }

  async setStatus({
    accountName,
    status,
  }: NSSteamAccountClientStateCacheRepository.SetStatusProps): Promise<void> {
    let foundState = this.state.get(accountName)
    if (!foundState) return
    foundState.status = status
    this.state.set(accountName, foundState)
  }

  async startFarm({
    accountName,
    when,
    initSession,
  }: NSSteamAccountClientStateCacheRepository.StartFarmProps): Promise<void> {
    let foundState = this.state.get(accountName)
    if (!foundState) return
    if (initSession) {
      foundState.farmStartedAt = when.getTime()
    }
    this.logger.log("starting the farm: ", foundState)
    this.state.set(accountName, foundState)
  }

  async deleteAllEntriesFromAccount(accountName: string): Promise<void> {
    this.state.delete(accountName)
    this.refreshTokens.delete(accountName)
  }

  async getPersona(accountName: string): Promise<SteamAccountPersonaState | null> {
    const persona = this.personas.get(accountName)
    return Promise.resolve(persona ?? null)
  }

  async setPersona(accountName: string, persona: SteamAccountPersonaState): Promise<void> {
    this.personas.set(accountName, persona)
  }

  async setRefreshToken(accountName: string, refreshToken: IRefreshToken): Promise<void> {
    this.refreshTokens.set(accountName, refreshToken)
  }
  async getRefreshToken(accountName: string): Promise<IRefreshToken | null> {
    return this.refreshTokens.get(accountName) ?? null
  }
  async getUsersRefreshToken(): Promise<string[]> {
    const keys = Array.from(this.refreshTokens.keys())
    return keys.map(key => `${key}:refreshToken`)
  }

  async init({ accountName, planId, username }: InitProps): Promise<void> {
    const foundState = await this.get(accountName)
    if (!foundState) {
      console.log(`No cache found for ${accountName}, setting initial state.`)
      this.state.set(accountName, {
        accountName,
        gamesPlaying: [],
        gamesStaging: [],
        isFarming: false,
        planId,
        username,
        farmStartedAt: null,
        status: "online",
      })
    }
  }

  async stopFarm(accountName: string): Promise<void> {
    let foundState = this.state.get(accountName)
    if (!foundState) return
    foundState.gamesPlaying = []
    foundState.isFarming = false
    foundState.farmStartedAt = null
    this.logger.log("stopping the farm: ", foundState)
    this.state.set(accountName, foundState)
  }

  async setPlayingGames(accountName: string, gamesId: number[]): Promise<void> {
    const prev = this.state.get(accountName)
    if (!prev) {
      return
    }

    const sacStateCache = new SACStateCache(
      gamesId,
      gamesId,
      accountName,
      prev.planId,
      prev.username,
      prev.farmStartedAt ? new Date(prev.farmStartedAt) : null,
      prev.status
    )
    this.state.set(accountName, sacStateCache.toJSON())
  }

  async setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void> {
    this.games.set(`${accountName}:games`, games)
  }

  async getAccountGames(accountName: string): Promise<AccountSteamGamesList | null> {
    return this.games.get(`${accountName}:games`) ?? null
  }

  async get(accountName: string): Promise<SACStateCacheDTO | null> {
    return this.state.get(accountName) ?? null
  }

  async delete(accountName: string): Promise<void> {
    this.state.delete(accountName)
  }

  async set(accountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO> {
    this.state.set(accountName, sacStateCache)
    return sacStateCache
  }

  async flushAll(): Promise<void> {
    this.state.clear()
  }
}
