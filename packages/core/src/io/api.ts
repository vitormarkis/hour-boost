import { AccountSteamGameDTO } from "core/entity"
import { ISteamAccountSession } from "./common"

export type API_GET_SteamAccounts = {
  steamAccounts: ISteamAccountSession[]
}

export type API_GET_AccountGames = {
  games: AccountSteamGameDTO[]
}
