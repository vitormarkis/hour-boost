export interface SteamAccountClientStateCacheRepository {
  getByAccountName(accontName: string): Promise<SACStateCache>
  set(sacStateCache: SACStateCache): Promise<any>
}

export interface SACStateCache {
  gamesPlaying: number[]
  isLogged: boolean
}
