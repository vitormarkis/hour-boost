export class UserSteamGamesList {
  constructor(readonly games: UserSteamGame[]) {}
}

export class UserSteamGame {
  constructor(
    readonly id: number,
    readonly imageUrl: string
  ) {}
}

type SteamGames = {}

export interface UserGames {
  app_count: number
  apps: App[]
}

interface App {
  content_descriptorids: any[]
  appid: number
  name: string
  playtime_2weeks: number
  playtime_forever: number
  img_icon_url: string
  has_community_visible_stats: boolean
  playtime_windows_forever: number
  playtime_mac_forever: number
  playtime_linux_forever: number
  rtime_last_played: number
  capsule_filename: any
  sort_as: any
  has_workshop: any
  has_market: any
  has_dlc: any
  has_leaderboards: any
}
