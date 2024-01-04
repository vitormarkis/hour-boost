import { ApplicationError, DataOrError, SteamAccount, SteamAccountsRepository, UseCase } from "core"

export namespace CheckSteamAccountOwnerStatusUseCaseHandle {
  export type Payload = {
    userId: string
    accountName: string
  }

  export type Response = DataOrError<"NOT_OWNED" | "OWNED_BY_USER" | "OWNED_BY_OTHER_USER">
}

export class CheckSteamAccountOwnerStatusUseCase
  implements
    UseCase<
      CheckSteamAccountOwnerStatusUseCaseHandle.Payload,
      CheckSteamAccountOwnerStatusUseCaseHandle.Response
    >
{
  constructor(private readonly steamAccountsRepository: SteamAccountsRepository) {}

  async execute({ userId, accountName }: APayload): AResponse {
    try {
      const foundSteamAccount = await this.steamAccountsRepository.getByAccountName(accountName)
      if (foundSteamAccount instanceof SteamAccount) {
        const userIsAccountOwner = foundSteamAccount.ownerId === userId
        return [null, userIsAccountOwner ? "OWNED_BY_USER" : "OWNED_BY_OTHER_USER"]
      } else if (foundSteamAccount === null) return [null, "NOT_OWNED"]
      return [new ApplicationError("Erro desconhecido da aplicação.", 400), null]
    } catch (error) {
      return [new ApplicationError("Erro desconhecido no servidor.", 500), null]
    }
  }
}

type APayload = CheckSteamAccountOwnerStatusUseCaseHandle.Payload
type AResponse = Promise<CheckSteamAccountOwnerStatusUseCaseHandle.Response>
