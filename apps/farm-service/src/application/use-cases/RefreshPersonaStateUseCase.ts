import {
  ApplicationError,
  DataOrError,
  SteamAccountClientStateCacheRepository,
  SteamAccountPersonaState,
} from "core"
import { AllUsersClientsStorage } from "~/application/services"

export class RefreshPersonaStateUseCase {
  constructor(
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage
  ) {}

  async execute(input: IRefreshPersonaState.Input): IRefreshPersonaState.Output {
    const sac = this.allUsersClientsStorage.getAccountClient(input.userId, input.accountName)
    if (!sac) {
      console.log({
        users: this.allUsersClientsStorage.listUsers(),
      })
      return [
        new ApplicationError(`Steam Account não encontrada para a conta ${input.accountName}`, 404, {
          userId: input.userId,
          accountName: input.accountName,
        }),
      ]
    }
    const [error, persona] = await sac.getAccountPersona()
    if (error) return [error]
    await this.steamAccountClientStateCacheRepository.setPersona(input.accountName, persona)
    return [null, persona]
  }
}

export namespace IRefreshPersonaState {
  export type Input = {
    userId: string
    accountName: string
  }
  export type Output = Promise<DataOrError<SteamAccountPersonaState>>
}
