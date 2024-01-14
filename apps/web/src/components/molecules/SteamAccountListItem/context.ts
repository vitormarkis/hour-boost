import { FarmGamesPayload } from "@/components/molecules/FarmGames/controller"
import { IntentionCodes } from "@/components/molecules/FarmGames/types"
import { IUserMethods } from "@/contexts/UserContext"
import { AppError } from "@/util/AppError"
import { DataOrMessage } from "@/util/DataOrMessage"
import { UseMutationResult } from "@tanstack/react-query"
import { API_GET_RefreshAccountGames } from "core"
import React, { Dispatch, SetStateAction, useContext } from "react"
import { SteamAccountAppProps, SteamAccountStatusLiveProps, SteamAccountStatusProps } from "./types"

export interface ISteamAccountListItemContext extends SteamAccountStatusProps, SteamAccountStatusLiveProps {
  app: SteamAccountAppProps
  stagingFarmGames: {
    urgentState: [state: boolean, setState: Dispatch<SetStateAction<boolean>>]
    toggleFarmGame(gameId: number, onError: (error: AppError) => void): void
    list: number[]
    hasGamesOnTheList(): boolean
    clear(): void
  }
  mutations: {
    stopFarm: MutationStopFarm
    refreshGames: MutationRefreshGames
    farmGames: MutationFarmGames
  }
  handlers: {
    handleFarmGames(
      accountName: string,
      gamesID: number[],
      userId: string
    ): Promise<{
      dataOrMessage: DataOrMessage<string, IntentionCodes>
    }>
  }
  modalSelectGames: {
    state: [state: boolean, setState: Dispatch<SetStateAction<boolean>>]
    openModal(): void
    closeModal(): void
  }
}

export const SteamAccountListItemContext = React.createContext({} as ISteamAccountListItemContext)

export function useSteamAccountListItem<R>(): ISteamAccountListItemContext
export function useSteamAccountListItem<R>(selector: (context: ISteamAccountListItemContext) => R): R
export function useSteamAccountListItem(selector?: (...args: any[]) => any) {
  const context = useContext(SteamAccountListItemContext)
  return selector ? selector(context) : context
}

export type MutationStopFarm = UseMutationResult<
  IUserMethods.DataOrError,
  unknown,
  {
    accountName: string
  },
  unknown
>

export type MutationRefreshGames = UseMutationResult<
  API_GET_RefreshAccountGames,
  unknown,
  {
    accountName: string
  },
  unknown
>

export type MutationFarmGames = UseMutationResult<
  DataOrMessage<string, IntentionCodes>,
  Error,
  FarmGamesPayload,
  unknown
>
