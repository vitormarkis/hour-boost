import { FarmGamesController } from "~/presentation/controllers"

export function makeFarmGames(farmGamesController: FarmGamesController) {
  return function farmGames(accountName: string, gamesID: number[], userId: string) {
    const response = farmGamesController.handle({
      payload: {
        accountName,
        gamesID,
        userId,
      },
    })

    return response
  }
}

export type TEST_FarmGames = ReturnType<typeof makeFarmGames>
