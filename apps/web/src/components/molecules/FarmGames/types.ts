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
}

export type ChooseFarmingGamesViewProps = React.ComponentPropsWithoutRef<"div"> & {
  helpers: ChooseFarmingGamesHelpers
  children: React.ReactNode
  state: [state: boolean, setState: Dispatch<SetStateAction<boolean>>]
}
