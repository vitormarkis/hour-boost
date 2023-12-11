export interface SteamAccountClientStateCacheRepository {
  get(keyUserAccountName: string): Promise<SACStateCacheDTO | null>
  set(keyUserAccountName: string, sacStateCache: SACStateCacheDTO): Promise<void>
}

export class SACStateCache {
  constructor(
    readonly gamesPlaying: number[],
    readonly accountName: string
  ) { }
  isFarming() {
    return this.gamesPlaying.length > 0
  }

  toJSON(): SACStateCacheDTO {
    return {
      gamesPlaying: this.gamesPlaying,
      accountName: this.accountName,
      isFarming: this.isFarming()
    }
  }
}

export interface SACStateCacheDTO {
  gamesPlaying: number[]
  accountName: string
  isFarming: boolean
}
