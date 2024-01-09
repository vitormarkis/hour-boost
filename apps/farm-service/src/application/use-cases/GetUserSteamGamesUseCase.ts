import { AccountSteamGamesList, DataOrError, SteamAccountClientStateCacheRepository } from "core"
import { RefreshGamesUseCase } from "~/presentation/presenters/RefreshGamesUseCase"

export class GetUserSteamGamesUseCase {
  constructor(
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly refreshGamesUseCase: RefreshGamesUseCase
  ) {}

  async execute({
    accountName,
    userId,
  }: GetUserSteamGamesUseCaseProps): Promise<DataOrError<AccountSteamGamesList>> {
    const foundSteamGamesList = await this.steamAccountClientStateCacheRepository.getAccountGames(accountName)
    if (foundSteamGamesList) return [null, foundSteamGamesList]
    const [error, steamGamesList] = await this.refreshGamesUseCase.execute({
      accountName,
      userId,
    })
    if (error) return [error]
    return [null, steamGamesList]
  }
}

export type GetUserSteamGamesUseCaseProps = {
  accountName: string
  userId: string
}
