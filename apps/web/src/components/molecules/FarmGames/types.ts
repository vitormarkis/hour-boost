import { FarmGamesPayload } from "@/components/molecules/FarmGames/controller"
import { IUserMethods } from "@/contexts/UserContext"
import { DataOrMessage } from "@/util/DataOrMessage"
import { UseMutationResult } from "@tanstack/react-query"
import { API_GET_RefreshAccountGames } from "core"
import { Dispatch, SetStateAction } from "react"

export type IntentionCodes =
  | "STEAM_GUARD_REQUIRED"
  | "SUCCESS"
  | "SAME_GAMES_ADDED"
  | "PLAN_MAX_USAGE_EXCEEDED"
// Seu plano não possui mais uso disponível.

export type ChooseFarmingGamesHelpers = {
  handleStopFarm(): void
  handleRefreshGames(): void
  handleFarmGame(gameId: number): void
  handleFarmGames(): Promise<void>
  stageFarmingGames: number[]
  stopFarm: MutationStopFarm
  refreshGames: MutationRefreshGames
  farmGames: MutationFarmGames
}

export type ChooseFarmingGamesViewProps = React.ComponentPropsWithoutRef<"div"> & {
  helpers: ChooseFarmingGamesHelpers
  children: React.ReactNode
  state: [state: boolean, setState: Dispatch<SetStateAction<boolean>>]
}

type MutationStopFarm = UseMutationResult<
  IUserMethods.DataOrError,
  unknown,
  {
    accountName: string
  },
  unknown
>

type MutationRefreshGames = UseMutationResult<
  API_GET_RefreshAccountGames,
  unknown,
  {
    accountName: string
  },
  unknown
>

type MutationFarmGames = UseMutationResult<
  DataOrMessage<string, IntentionCodes>,
  Error,
  FarmGamesPayload,
  unknown
>
