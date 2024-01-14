import { IntentionCodes } from "@/components/molecules/FarmGames/types"
import { Message } from "@/util/DataOrMessage"
import { GameSession } from "core"
import { toast } from "sonner"

export const showToastFarmingGame = (stagingFarmGamesList: number[], userGames: GameSession[]) => {
  const gamesNames: string[] = stagingFarmGamesList.map(gameId => userGames.find(g => g.id === gameId)!.name)
  toast.success(`Farmando os jogos ${gamesNames.join(", ")}.`)
}

export const showToastFarmGamesResult = (undesired: Message<"UNKNOWN" | IntentionCodes>) => {
  toast[undesired.type](undesired.message)
}
