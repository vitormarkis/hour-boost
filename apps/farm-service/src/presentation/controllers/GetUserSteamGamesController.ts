import { GetUserSteamGamesUseCase } from "~/application/use-cases/GetUserSteamGamesUseCase"
import { HttpClient } from "~/contracts"

export class GetUserSteamGamesController {
  constructor(private readonly getUserSteamGamesUseCase: GetUserSteamGamesUseCase) {}

  async handle({
    payload: { userId, accountName },
  }: HttpClient.Request<IGetUserSteamGames>): Promise<HttpClient.Response> {
    const [error, games] = await this.getUserSteamGamesUseCase.execute(userId, accountName)
    if (error) throw error
    return {
      status: 200,
      json: {
        games: games.toJSON(),
      },
    }
  }
}

type IGetUserSteamGames = {
  userId: string
  accountName: string
}
