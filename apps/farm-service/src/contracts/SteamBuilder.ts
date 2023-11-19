import SteamUser from "steam-user"

export interface SteamBuilder {
  create(): SteamUser
}
