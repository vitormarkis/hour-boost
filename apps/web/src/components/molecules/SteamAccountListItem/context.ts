import { SteamAccountStatusProps, SteamAccountStatusLiveProps, SteamAccountAppProps } from "./types"
import React from "react"

export interface ISteamAccountListItemContext extends SteamAccountStatusProps, SteamAccountStatusLiveProps {
  app: SteamAccountAppProps
}

export const SteamAccountListItemContext = React.createContext({} as ISteamAccountListItemContext)
