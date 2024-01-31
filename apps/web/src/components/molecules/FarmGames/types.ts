import { GameSession } from "core"
import { ChangeEvent, ComponentProps } from "react"

export type IntentionCodes =
  | "STEAM_GUARD_REQUIRED"
  | "SUCCESS"
  | "SAME_GAMES_ADDED"
  | "PLAN_MAX_USAGE_EXCEEDED"

// Seu plano não possui mais uso disponível.

export type ChooseFarmingGamesHelpers = {
  handleStopFarm(): void
  handleRefreshGames(): void
  handleActionButton(): Promise<void>
  handleAddGameToFarmStaging(gameId: number): void
  clearLocalStagingFarmList(): void
  gameList: GameSession[] | null
  actionSavingState: boolean
  onOpenChange(isOpen: boolean): void
  gamesStaging: string
  handleFilterInput: {
    value: string
    onChange(e: ChangeEvent<HTMLInputElement>): void
  }
  localStagingSelectedGames: string
}
