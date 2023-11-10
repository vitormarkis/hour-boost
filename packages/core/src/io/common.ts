export interface ISteamGame {
  id_steamGame: string
  gameId: string
}

export interface ISteamAccountSession {
  id_steamAccount: string
  accountName: string
  games: ISteamGame[]
}
