import {
  AccountSteamGamesList,
  CacheState,
  IRefreshToken,
  InitProps,
  SteamAccountClientStateCacheRepository,
  SteamAccountPersonaState,
} from "core"
import { SACCacheInMemory } from "~/infra/repository/SACCacheInMemory"
import { Logger } from "~/utils/Logger"

export class SteamAccountClientStateCacheInMemory implements SteamAccountClientStateCacheRepository {
  protected readonly logger = new Logger("sac-cache-in-memory")
  data: SACCacheInMemory

  constructor(database: SACCacheInMemory) {
    this.data = database
  }

  async init(props: InitProps): Promise<void> {
    this.data.state.set(
      props.accountName,
      CacheState.create({
        ...props,
        status: "offline",
      })
    )
  }
  async get(accountName: string): Promise<CacheState | null> {
    return this.data.state.get(accountName) ?? null
  }

  async save(state: CacheState): Promise<void> {
    this.data.state.set(state.accountName, state)
  }

  async getAccountGames(accountName: string): Promise<AccountSteamGamesList | null> {
    return this.data.games.get(`${accountName}:games`) ?? null
  }

  async setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void> {
    this.data.games.set(`${accountName}:games`, games)
  }

  async setRefreshToken(accountName: string, refreshToken: IRefreshToken): Promise<void> {
    this.data.refreshTokens.set(accountName, refreshToken)
  }

  async getRefreshToken(accountName: string): Promise<IRefreshToken | null> {
    return this.data.refreshTokens.get(accountName) ?? null
  }
  async getUsersRefreshToken(): Promise<string[]> {
    const keys = Array.from(this.data.refreshTokens.keys())
    return keys.map(key => `${key}:refreshToken`)
  }
  async flushAll(): Promise<void> {
    this.data.state.clear()
  }
  async getPersona(accountName: string): Promise<SteamAccountPersonaState | null> {
    const persona = this.data.personas.get(accountName)
    return Promise.resolve(persona ?? null)
  }

  async setPersona(accountName: string, persona: SteamAccountPersonaState): Promise<void> {
    this.data.personas.set(accountName, persona)
  }

  async deleteAllEntriesFromAccount(accountName: string): Promise<void> {
    this.data.state.delete(accountName)
    this.data.refreshTokens.delete(accountName)
  }
}
