import { AccountSteamGamesList, SACStateCacheDTO, SteamAccountClientStateCacheRepository } from "core"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  private readonly state: Map<string, SACStateCacheDTO> = new Map()
  private readonly games: Map<string, AccountSteamGamesList> = new Map()
  private readonly refreshTokens: Map<string, string> = new Map()

  async init(accountName: string): Promise<void> {
    const foundState = await this.get(accountName)
    if (!foundState) {
      console.log(`No cache found for ${accountName}, setting initial state.`)
      this.state.set(accountName, {
        accountName,
        gamesPlaying: [],
        isFarming: false,
      })
    }
  }

  async setPlayingGames(accountName: string, gamesId: number[]): Promise<void> {
    const prev = this.state.get(accountName)
    if (!prev) return
    this.state.set(accountName, {
      ...prev,
      gamesPlaying: gamesId,
    })
  }

  async setRefreshToken(accountName: string, refreshToken: string): Promise<void> {
    this.refreshTokens.set(accountName, refreshToken)
  }
  async getRefreshToken(accountName: string): Promise<string | null> {
    const foundRefreshToken = this.refreshTokens.get(accountName)
    return foundRefreshToken ?? null
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
