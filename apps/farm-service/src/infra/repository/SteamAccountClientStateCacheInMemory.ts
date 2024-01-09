import {
  AccountSteamGamesList,
  IRefreshToken,
  InitProps,
  SACStateCacheDTO,
  SteamAccountClientStateCacheRepository,
  SteamAccountPersonaState,
} from "core"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly state: Map<string, SACStateCacheDTO> = new Map()
  private readonly games: Map<string, AccountSteamGamesList> = new Map()
  private readonly refreshTokens: Map<string, IRefreshToken> = new Map()
  private readonly personas: Map<string, SteamAccountPersonaState> = new Map()

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
        isFarming: false,
        planId,
        username,
      })
    }
  }

  async stopFarm(accountName: string): Promise<void> {
    let foundState = this.state.get(accountName)
    if (!foundState) return
    foundState.gamesPlaying = []
    foundState.isFarming = false
    this.state.set(accountName, foundState)
  }

  async setPlayingGames(accountName: string, gamesId: number[]): Promise<void> {
    const prev = this.state.get(accountName)
    if (!prev) return
    this.state.set(accountName, {
      ...prev,
      gamesPlaying: gamesId,
    })
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
