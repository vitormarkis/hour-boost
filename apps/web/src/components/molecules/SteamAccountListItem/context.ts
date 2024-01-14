import { SteamAccountStatusProps, SteamAccountStatusLiveProps, SteamAccountAppProps } from "./types"
import React, { Dispatch, SetStateAction } from "react"

export interface ISteamAccountListItemContext extends SteamAccountStatusProps, SteamAccountStatusLiveProps {
  app: SteamAccountAppProps
  modalSelectGames: {
    state: [state: boolean, setState: Dispatch<SetStateAction<boolean>>]
    openModal(): void
    closeModal(): void
  }
}

export const SteamAccountListItemContext = React.createContext({} as ISteamAccountListItemContext)
