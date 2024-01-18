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
    await this.steamAccountClientStateCacheRepository.setStatus({ accountName, status })
    sac.setStatus(status)
    return [null, 200]
  }
}

type APayload = ChangeAccountStatusUseCaseHandle.Payload
