import { FarmGamesPayload } from "@/components/molecules/FarmGames/controller"
import { IntentionCodes as IntentionCodes_FarmGames } from "@/components/molecules/FarmGames/types"
import { HHandlers } from "@/components/molecules/SteamAccountListItem/hooks/useHandlers"
import { StopFarmPayload } from "@/components/molecules/StopFarm/controller"
import { IntentionCodes as IntentionCodes_StopFarm } from "@/components/molecules/StopFarm/types"
import { DataOrMessage } from "@/util/DataOrMessage"
import { UseMutationResult } from "@tanstack/react-query"
import { API_GET_RefreshAccountGames, AppAccountStatus } from "core"
import React from "react"
import { HStagingFarmGames } from "./hooks/useStagingFarmGames"
import { SteamAccountAppProps, SteamAccountStatusLiveProps, SteamAccountStatusProps } from "./types"

export interface ISteamAccountListItemContext extends SteamAccountStatusProps, SteamAccountStatusLiveProps {
  app: SteamAccountAppProps
  isFarming(): boolean
  hasUsagePlanLeft(): boolean
  status: AppAccountStatus
  setStatus(newStatus: AppAccountStatus): Promise<void>
  stagingFarmGames: HStagingFarmGames
  mutations: {
    stopFarm: MutationStopFarm
    refreshGames: MutationRefreshGames
    farmGames: MutationFarmGames
  }
  handlers: HHandlers
  modalSelectGames: {
    state: [state: boolean, setState: React.Dispatch<React.SetStateAction<boolean>>]
    openModal(): void
    closeModal(): void
  }
}

export const SteamAccountListItemContext = React.createContext({} as ISteamAccountListItemContext)

export function useSteamAccountListItem<R>(): ISteamAccountListItemContext
export function useSteamAccountListItem<R>(selector: (context: ISteamAccountListItemContext) => R): R
export function useSteamAccountListItem(selector?: (...args: any[]) => any) {
  const context = React.useContext(SteamAccountListItemContext)
  return selector ? selector(context) : context
}

export type MutationStopFarm = UseMutationResult<
  DataOrMessage<string, IntentionCodes_StopFarm>,
  Error,
  StopFarmPayload,
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
  DataOrMessage<string, IntentionCodes_FarmGames>,
  Error,
  FarmGamesPayload,
  unknown
>
