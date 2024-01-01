import { GameSession } from "core/presenters"
import { ISteamAccountSession } from "./common"

export type API_GET_SteamAccounts = {
  steamAccounts: ISteamAccountSession[]
}

export type API_GET_AccountGames = {
  games: GameSession[]
}

export type API_GET_RefreshAccountGames = {
  games: GameSession[]
}
