export interface SteamAccountClientStateCacheRepository {
  get(keyUserAccountName: string): Promise<SACStateCache | null>
  set(keyUserAccountName: string, sacStateCache: SACStateCache): Promise<void>
}

export class SACStateCache {

  constructor(
    readonly gamesPlaying: number[],
    readonly accountName: string,
  ) {
  }
  isFarming() {
    return this.gamesPlaying.length > 0
  }
}

