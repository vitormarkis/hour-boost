import { AccountSteamGamesList } from "core/entity"

export interface SteamAccountClientStateCacheRepository {
  get(accountName: string): Promise<SACStateCacheDTO | null>
  set(accountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO>
  delete(accountName: string): Promise<void>
  getAccountGames(accountName: string): Promise<AccountSteamGamesList | null>
  setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void>
  setRefreshToken(accountName: string, refreshToken: string): Promise<void>
  getRefreshToken(accountName: string): Promise<string | null>
  setPlayingGames(accountName: string, gamesId: number[]): Promise<void>
  init(accountName: string): Promise<void>
  flushAll(): Promise<void>
}

export class SACStateCache {
  constructor(
    readonly gamesPlaying: number[],
    readonly accountName: string
  ) {}
  isFarming() {
    return this.gamesPlaying.length > 0
  }

  toJSON(): SACStateCacheDTO {
    return {
      gamesPlaying: this.gamesPlaying,
      accountName: this.accountName,
      isFarming: this.isFarming(),
    }
  }
}

export interface SACStateCacheDTO {
  gamesPlaying: number[]
  accountName: string
  isFarming: boolean
}
