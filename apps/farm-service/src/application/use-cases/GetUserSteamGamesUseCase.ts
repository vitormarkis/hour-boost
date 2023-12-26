import { AccountSteamGamesList, DataOrError, SteamAccountClientStateCacheRepository } from "core"
import { RefreshGamesUseCase } from "~/presentation/presenters/RefreshGamesUseCase"

export class GetUserSteamGamesUseCase {
  constructor(
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly refreshGamesUseCase: RefreshGamesUseCase
  ) {}

  async execute(userId: string, accountName: string): Promise<DataOrError<AccountSteamGamesList>> {
    const foundSteamGamesList = await this.steamAccountClientStateCacheRepository.getAccountGames(accountName)
    if (foundSteamGamesList) return [null, foundSteamGamesList]
    const [error, steamGamesList] = await this.refreshGamesUseCase.execute(userId, accountName)
    if (error) return [error, null]
    return [null, steamGamesList]
  }
}
