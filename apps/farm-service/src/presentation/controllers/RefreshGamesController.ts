import { API_GET_RefreshAccountGames, Controller, HttpClient } from "core"
import { RefreshGamesUseCase, RefreshGamesUseCaseProps } from "~/presentation/presenters/RefreshGamesUseCase"

export class RefreshGamesController implements Controller<RefreshGames.Payload, RefreshGames.Response> {
  constructor(private readonly refreshGamesUseCase: RefreshGamesUseCase) {}

  async handle({
    payload,
  }: HttpClient.Request<RefreshGames.Payload>): Promise<HttpClient.Response<RefreshGames.Response>> {
    const input: RefreshGamesUseCaseProps = {
      accountName: payload.accountName,
      userId: payload.userId,
    }
    const [error, accountSteamGamesList] = await this.refreshGamesUseCase.execute(input)
    if (error) throw error
    return {
      status: 200,
      json: {
        games: accountSteamGamesList.toJSON(),
      } satisfies API_GET_RefreshAccountGames,
    }
  }
}

export namespace RefreshGames {
  export type Payload = {
    userId: string
    accountName: string
  }

  export type Response = API_GET_RefreshAccountGames
}
