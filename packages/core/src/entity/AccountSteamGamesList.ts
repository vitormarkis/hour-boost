import { GameSession } from "core/presenters"

export class AccountSteamGamesList {
  constructor(readonly games: GameSession[]) {}

  toJSON(): GameSession[] {
    return this.games.map(g => ({
      id: g.id,
      imageUrl: g.imageUrl,
      name: g.name,
    }))
  }
}

type SteamGames = {}

export interface AccountGames {
  app_count: number
  apps: App[]
}

interface App {
  content_descriptorids?: any[]
  appid: number
  name?: string
  playtime_2weeks?: number
  playtime_forever?: number
  img_icon_url: string
  has_community_visible_stats?: boolean
  playtime_windows_forever?: number
  playtime_mac_forever?: number
  playtime_linux_forever?: number
  rtime_last_played?: number
  capsule_filename?: any
  sort_as?: any
  has_workshop?: any
  has_market?: any
  has_dlc?: any
  has_leaderboards?: any
}
