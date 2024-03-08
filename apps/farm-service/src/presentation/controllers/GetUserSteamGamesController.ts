import type { API_GET_AccountGames, Controller, HttpClient } from "core"
import type {
  GetUserSteamGamesUseCase,
  GetUserSteamGamesUseCaseProps,
} from "~/application/use-cases/GetUserSteamGamesUseCase"

export class GetUserSteamGamesController
  implements Controller<GetUserSteamGames.Payload, GetUserSteamGames.Response>
{
  constructor(private readonly getUserSteamGamesUseCase: GetUserSteamGamesUseCase) {}

  async handle({
    payload,
  }: HttpClient.Request<GetUserSteamGames.Payload>): Promise<
    HttpClient.Response<GetUserSteamGames.Response>
  > {
    const input: GetUserSteamGamesUseCaseProps = {
      accountName: payload.accountName,
      userId: payload.userId,
    }
    const [error, accountSteamGamesList] = await this.getUserSteamGamesUseCase.execute(input)
    if (error) throw error
    return Promise.resolve({
      status: 200,
      json: {
        games: accountSteamGamesList.toJSON(),
      },
    })
  }
}

export namespace GetUserSteamGames {
  export type Payload = {
    userId: string
    accountName: string
  }

  export type Response = API_GET_AccountGames
}
