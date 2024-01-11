import { SteamAccountSession } from "core"

export type SteamAccountStatusLiveProps = {
  autoRestarter?: boolean
  isFarming?: boolean
  steamGuard?: boolean
  status: "offline" | "online"
  hoursFarmedInSeconds: number
  farmingTime: number
}

export type SteamAccountStatusProps = {
  header?: boolean
  maxGamesAllowed: number
}

export type SteamAccountAppProps = SteamAccountSession
