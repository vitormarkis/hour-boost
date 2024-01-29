import { SACStateCacheDTO, AccountSteamGamesList, IRefreshToken, SteamAccountPersonaState } from "core"

export class SACCacheInMemory {
  readonly state: Map<string, SACStateCacheDTO> = new Map()
  readonly games: Map<string, AccountSteamGamesList> = new Map()
  readonly refreshTokens: Map<string, IRefreshToken> = new Map()
  readonly personas: Map<string, SteamAccountPersonaState> = new Map()
}
