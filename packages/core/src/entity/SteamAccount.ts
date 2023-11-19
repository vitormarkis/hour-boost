import { SteamGame } from "./SteamGame"
import { SteamAccountCredentials } from "./SteamAccountCredentials"
import { IDGenerator } from "../contracts"

export class SteamAccount {
  id_steamAccount: string
  games: SteamGame[]
  credentials: SteamAccountCredentials

  private constructor(props: SteamAccountProps) {
    this.id_steamAccount = props.id_steamAccount
    this.games = props.games
    this.credentials = props.credentials
  }

  static create(props: SteamAccountCreateProps) {
    return new SteamAccount({
      ...props,
      games: [],
      id_steamAccount: props.idGenerator.makeID(),
    })
  }

  static restore(props: SteamAccountProps) {
    return new SteamAccount(props)
  }

  addGame(game: SteamGame) {
    this.games.push(game)
  }

  removeGameByID(gameId: string) {
    this.games = this.games.filter(g => g.gameId !== gameId)
  }
}

type SteamAccountProps = {
  id_steamAccount: string
  games: SteamGame[]
  credentials: SteamAccountCredentials
}

type SteamAccountCreateProps = {
  credentials: SteamAccountCredentials
  idGenerator: IDGenerator
}
