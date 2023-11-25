import { SteamAccountCredentials } from "./SteamAccountCredentials"
import { IDGenerator } from "../contracts"

export class SteamAccount {
  id_steamAccount: string
  credentials: SteamAccountCredentials

  private constructor(props: SteamAccountProps) {
    this.id_steamAccount = props.id_steamAccount
    this.credentials = props.credentials
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
}

type SteamAccountProps = {
  id_steamAccount: string
  credentials: SteamAccountCredentials
}

type SteamAccountCreateProps = {
  credentials: SteamAccountCredentials
  idGenerator: IDGenerator
}
