import {
  AppAccountStatus,
  ApplicationError,
  DataOrError,
  SteamAccountClientStateCacheRepository,
  UseCase,
} from "core"
import { AllUsersClientsStorage } from "~/application/services"

export namespace ChangeAccountStatusUseCaseHandle {
  export type Payload = {
    userId: string
    accountName: string
    status: AppAccountStatus
  }
}

export class ChangeAccountStatusUseCase implements UseCase<ChangeAccountStatusUseCaseHandle.Payload> {
  constructor(
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async execute({ accountName, userId, status }: APayload): Promise<DataOrError<200>> {
    const sac = this.allUsersClientsStorage.getAccountClient(userId, accountName)
    if (!sac) return [new ApplicationError("NSTH: Nenhuma conta encontrada.")]
    sac.setStatus(status)
    await this.steamAccountClientStateCacheRepository.save(sac.getCache())
    return [null, 200]
  }
}

type APayload = ChangeAccountStatusUseCaseHandle.Payload
