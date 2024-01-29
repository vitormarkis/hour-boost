import { GameSession } from "core"

export type IntentionCodes =
  | "STEAM_GUARD_REQUIRED"
  | "SUCCESS"
  | "SAME_GAMES_ADDED"
  | "PLAN_MAX_USAGE_EXCEEDED"

// Seu plano não possui mais uso disponível.

export type ChooseFarmingGamesHelpers = {
  handleStopFarm(): void
  handleRefreshGames(): void
  handleUpdateStagingGames(): void
  handleActionButton(): Promise<void>
  handleAddGameToFarmStaging(gameId: number): void
  clearLocalStagingFarmList(): void
  gameList: GameSession[] | null
  actionSavingState: boolean
}
