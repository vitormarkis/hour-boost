import { IDGenerator } from "../contracts"
import { SteamAccountCredentials } from "./SteamAccountCredentials"

export class SteamAccount {
  id_steamAccount: string
  credentials: SteamAccountCredentials
  ownerId: string | null

  private constructor(props: SteamAccountProps) {
    this.id_steamAccount = props.id_steamAccount
    this.credentials = props.credentials
    this.ownerId = props.ownerId
  }

  static create(props: SteamAccountCreateProps) {
    return new SteamAccount({
      ...props,
      id_steamAccount: props.idGenerator.makeID(),
    })
  }

  static restore(props: SteamAccountProps) {
    return new SteamAccount(props)
  }

  disown() {
    this.ownerId = null
  }
}

type SteamAccountProps = {
  id_steamAccount: string
  credentials: SteamAccountCredentials
  ownerId: string | null
}

type SteamAccountCreateProps = {
  credentials: SteamAccountCredentials
  idGenerator: IDGenerator
  ownerId: string | null
}
