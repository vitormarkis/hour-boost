import { AccountSteamGamesList } from "core/entity"

export interface SteamAccountClientStateCacheRepository {
  get(accountName: string): Promise<SACStateCacheDTO | null>
  set(accountName: string, sacStateCache: SACStateCacheDTO): Promise<SACStateCacheDTO>
  delete(accountName: string): Promise<void>
  getAccountGames(accountName: string): Promise<AccountSteamGamesList | null>
  setAccountGames(accountName: string, games: AccountSteamGamesList): Promise<void>
  setRefreshToken(accountName: string, refreshToken: IRefreshToken): Promise<void>
  getRefreshToken(accountName: string): Promise<IRefreshToken | null>
  setPlayingGames(accountName: string, gamesId: number[], planId: string, username: string): Promise<void>
  init(props: InitProps): Promise<void>
  getUsersRefreshToken(): Promise<string[]>
  flushAll(): Promise<void>
  getPersona(accountName: string): Promise<SteamAccountPersonaState | null>
  setPersona(accountName: string, persona: SteamAccountPersonaState): Promise<void>
  stopFarm(accountName: string): Promise<void>
  deleteAllEntriesFromAccount(accountName: string): Promise<void>
  startFarm(props: NSSteamAccountClientStateCacheRepository.StartFarmProps): Promise<void>
}

export namespace NSSteamAccountClientStateCacheRepository {
  export type StartFarmProps = {
    accountName: string
    when: Date
    initSession?: boolean
  }
}

export interface SteamAccountPersonaState {
  accountName: string
  profilePictureUrl: string
}

export type InitProps = {
  accountName: string
  planId: string
  username: string
}

export interface IRefreshToken {
  refreshToken: string
  userId: string
  username: string
  planId: string
}

export class SACStateCache {
  constructor(
    readonly gamesPlaying: number[],
    readonly accountName: string,
    readonly planId: string,
    readonly username: string,
    readonly farmStartedAt: Date | null = null
  ) {}
  isFarming() {
    return this.gamesPlaying.length > 0
  }

  toJSON(): SACStateCacheDTO {
    return {
      gamesPlaying: this.gamesPlaying,
      accountName: this.accountName,
      isFarming: this.isFarming(),
      planId: this.planId,
      username: this.username,
      farmStartedAt: this.farmStartedAt?.getTime() ?? null,
    }
  }
}

export interface SACStateCacheDTO {
  gamesPlaying: number[]
  accountName: string
  isFarming: boolean
  username: string
  planId: string
  farmStartedAt: number | null
}
