import { SteamAccountPersonaState, DataOrError, SteamAccountClientStateCacheRepository } from "core"
import { RefreshPersonaStateUseCase } from "~/application/use-cases/RefreshPersonaStateUseCase"

export class GetPersonaStateUseCase {
  constructor(
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly refreshPersonaState: RefreshPersonaStateUseCase
  ) {}

  async execute(input: IGetPersonaState.Input): IGetPersonaState.Output {
    const foundPersona = await this.steamAccountClientStateCacheRepository.getPersona(input.accountName)
    if (foundPersona) return [null, foundPersona]
    return this.refreshPersonaState.execute(input)
  }
}

export namespace IGetPersonaState {
  export type Input = {
    accountName: string
    userId: string
  }
  export type Output = Promise<DataOrError<SteamAccountPersonaState>>
}
