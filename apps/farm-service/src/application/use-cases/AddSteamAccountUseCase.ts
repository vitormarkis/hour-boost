import {
  AddSteamAccount,
  AddSteamAccountHTTPResponse,
  ApplicationError,
  DataOrError,
  UseCase,
  UsersDAO,
} from "core"
import { AllUsersClientsStorage } from "~/application/services"
import { CheckSteamAccountOwnerStatusUseCase } from "~/application/use-cases"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { SteamClientEventsRequired } from "~/utils/SteamClientEventsRequired"

export namespace AddSteamAccountUseCaseHandle {
  export type Payload = {
    accountName: string
    password: string
    userId: string
    authCode?: string
  }

  export type Response = DataOrError<AddSteamAccountHTTPResponse>
}

export class AddSteamAccountUseCase
  implements UseCase<AddSteamAccountUseCaseHandle.Payload, Promise<AddSteamAccountUseCaseHandle.Response>>
{
  constructor(
    private readonly addSteamAccount: AddSteamAccount,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersDAO: UsersDAO,
    private readonly checkSteamAccountOwnerStatusUseCase: CheckSteamAccountOwnerStatusUseCase
  ) {}

  async execute({ accountName, password, userId, authCode }: APayload): Promise<AResponse> {
    const { username } = (await this.usersDAO.getUsername(userId)) ?? {}
    const planId = await this.usersDAO.getPlanId(userId)
    if (!planId)
      return [
        new ApplicationError(`Nenhum plano encontrado para userId: [${userId}] com planId: [${planId}]`),
      ]
    if (!username) return [new ApplicationError("Nenhum usuário encontrado com esse id.")]

    const [errorCheckingUserOwnerStatus, accountOwnerStatus] =
      await this.checkSteamAccountOwnerStatusUseCase.execute({
        accountName,
        userId,
      })
    if (errorCheckingUserOwnerStatus) return [errorCheckingUserOwnerStatus]
    if (accountOwnerStatus === "OWNED_BY_OTHER_USER")
      return [new ApplicationError("Essa conta da Steam já foi registrada por outro usuário.", 403)]
    if (accountOwnerStatus === "OWNED_BY_USER")
      return [new ApplicationError("Você já possui essa conta cadastrada.")]

    const sac = this.allUsersClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username,
      planId,
    })

    if (sac.logged) {
      const { steamAccountId } = await this.addSteamAccount.execute({
        accountName,
        password,
        userId,
      })

      return [
        null,
        {
          message: `${accountName} adicionada com sucesso!`,
          steamAccountId,
        },
      ]
    }
    sac.login(accountName, password, authCode)

    const steamClientEventsRequired = new SteamClientEventsRequired(sac, EVENT_PROMISES_TIMEOUT_IN_SECONDS)

    console.log("Never resolving IN")
    const eventsPromisesResolved = await Promise.race(
      steamClientEventsRequired.getEventPromises({
        loggedOn: true,
        steamGuard: true,
        error: true,
        timeout: true,
      })
    )
    console.log("Never resolving OUT")

    if (eventsPromisesResolved.type === "steamGuard") {
      const [domain, setCode] = eventsPromisesResolved.args
      this.allUsersClientsStorage.addSteamAccount(userId, sac)
      sac.setManualHandler("steamGuard", code => setCode(code))
      return [
        new ApplicationError(
          `Steam Guard requerido. Enviando para ${domain ? `e-mail com final ${domain}` : `seu celular.`}`,
          202
        ),
      ]
    }

    if (eventsPromisesResolved.type === "error") {
      const [error] = eventsPromisesResolved.args
      if (error.eresult === 18)
        return [
          new ApplicationError(
            "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente.",
            404,
            error
          ),
        ]
      if (error.eresult === 5) return [new ApplicationError("Conta ou senha incorretas.", 403, error)]
      return [
        new ApplicationError("Aconteceu algum erro no client da Steam.", 400, {
          eresult: error.eresult,
        }),
      ]
    }

    if (eventsPromisesResolved.type === "loggedOn") {
      const { steamAccountId } = await this.addSteamAccount.execute({
        accountName,
        password,
        userId,
      })

      return [
        null,
        {
          message: `${accountName} adicionada com sucesso!`,
          steamAccountId,
        },
      ]
    }
    return [
      new ApplicationError("Erro desconhecido", 400, {
        accountName,
        password,
        userId,
        authCode,
      }),
    ]
  }
}

type APayload = AddSteamAccountUseCaseHandle.Payload
type AResponse = Promise<AddSteamAccountUseCaseHandle.Response>
