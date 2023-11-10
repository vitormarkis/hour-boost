import { makeID } from "./generateID"

export class SteamGame {
  readonly id_steamGame: string
  readonly gameId: string

  private constructor(props: SteamGameProps) {
    this.id_steamGame = props.id_steamGame
    this.gameId = props.gameId
  }

  static create(props: SteamGameCreateProps) {
    return new SteamGame({
      ...props,
      id_steamGame: makeID(),
    })
  }

  static restore(props: SteamGameProps) {
    return new SteamGame(props)
  }
}

type SteamGameProps = {
  id_steamGame: string
  gameId: string
}

type SteamGameCreateProps = {
  gameId: string
}
