import { AccountSteamGamesList, DataOrError, SteamAccountClientStateCacheRepository } from "core"
import { AllUsersClientsStorage } from "~/application/services"

export class RefreshGamesUseCase {
  constructor(
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage
  ) {}

  async execute({
    accountName,
    userId,
  }: RefreshGamesUseCaseProps): Promise<DataOrError<AccountSteamGamesList>> {
    const sac = this.allUsersClientsStorage.getAccountClientOrThrow(userId, accountName)
    const [error, accountSteamGamesList] = await sac.getAccountGamesList()
    if (error) return [error, null]
    await this.steamAccountClientStateCacheRepository.setAccountGames(accountName, accountSteamGamesList)
    return [null, accountSteamGamesList]
  }
}

export type RefreshGamesUseCaseProps = {
  accountName: string
  userId: string
}
