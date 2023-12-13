import SteamUser from "steam-user"

export interface Builder<T> {
  create(...args: any[]): T
}

export interface SteamClientBuilder extends Builder<SteamUser> {}
