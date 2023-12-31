import { AddSteamAccount, ApplicationError, Controller, HttpClient, UsersDAO } from "core"
import { AllUsersClientsStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { CheckSteamAccountOwnerStatusUseCase } from "~/application/use-cases"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { EventParameters } from "~/infra/services"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { EventParametersTimeout, FarmGamesEventsResolve, SingleEventResolver } from "~/types/EventsApp.types"
import { makeRes } from "~/utils"

export type Resolved = {
  json:
    | ({
        message: string
      } & Record<string, any>)
    | null
  status: number
}

export namespace AddSteamAccountHandle {
  export type Payload = {
    accountName: string
    password: string
    userId: string
    authCode?: string
  }

  export type Response = {}
}

export class AddSteamAccountController
  implements Controller<AddSteamAccountHandle.Payload, AddSteamAccountHandle.Response>
{
  constructor(
    private readonly addSteamAccount: AddSteamAccount,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersDAO: UsersDAO,
    private readonly checkSteamAccountOwnerStatusUseCase: CheckSteamAccountOwnerStatusUseCase
  ) {}

  async handle({ payload }: APayload): AResponse {
    const perform = async () => {
      const { accountName, password, userId, authCode } = payload
      const { username } = (await this.usersDAO.getUsername(userId)) ?? {}

      const planId = await this.usersDAO.getPlanId(userId)
      if (!planId)
        throw new ApplicationError(`Nenhum plano encontrado para userId: [${userId}] com planId: [${planId}]`)
      if (!username) throw new ApplicationError("Nenhum usuário encontrado com esse id.")

      const [error, accountOwnerStatus] = await this.checkSteamAccountOwnerStatusUseCase.execute({
        accountName,
        userId,
      })
      if (error) throw error
      if (accountOwnerStatus === "OWNED_BY_OTHER_USER")
        throw new ApplicationError("Essa conta da Steam já foi registrada por outro usuário.", 403)
      if (accountOwnerStatus === "OWNED_BY_USER")
        throw new ApplicationError("Você já possui essa conta cadastrada.")

      const sac = this.allUsersClientsStorage.getOrAddSteamAccount({
        accountName,
        userId,
        username,
        planId,
      })

      if (sac.logged) {
        const { steamAccountID } = await this.addSteamAccount.execute({
          accountName,
          password,
          userId,
        })

        return {
          status: 201,
          json: {
            message: `${accountName} adicionada com sucesso!`,
            steamAccountID,
          },
        } as HttpClient.Response
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
        return makeRes(
          202,
          `Steam Guard requerido. Enviando para ${domain ? `e-mail com final ${domain}` : `seu celular.`}`
        )
      }

      if (eventsPromisesResolved.type === "error") {
        const [error] = eventsPromisesResolved.args
        if (error.eresult === 18)
          return makeRes(
            404,
            "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente.",
            error
          )
        if (error.eresult === 5) return makeRes(403, "Conta ou senha incorretas.", error)
        return makeRes(400, "Aconteceu algum erro no client da Steam.", {
          eresult: error.eresult,
        })
      }

      if (eventsPromisesResolved.type === "loggedOn") {
        const { steamAccountID } = await this.addSteamAccount.execute({
          accountName,
          password,
          userId,
        })

        return {
          status: 201,
          json: {
            message: `${accountName} adicionada com sucesso!`,
            steamAccountID,
          },
        } as HttpClient.Response
      }

      console.log({ when: new Date(), sacEvents: eventsPromisesResolved })
      throw new ApplicationError("SAC emitted an unhandled event.")
    }

    return promiseHandler(perform())
  }
}

type APayload = HttpClient.Request<AddSteamAccountHandle.Payload>
type AResponse = Promise<HttpClient.Response<AddSteamAccountHandle.Response>>

type RequiredEventTimeoutNames = keyof (EventParameters & EventParametersTimeout)
type EventPromises = Partial<Record<RequiredEventTimeoutNames, boolean>>

export class SteamClientEventsRequired {
  constructor(
    private readonly sac: SteamAccountClient,
    private readonly timeoutLimitInSeconds: number
  ) {}

  createEventPromiseResolver<K extends keyof EventParameters>(eventName: K) {
    return new Promise<SingleEventResolver<EventParameters, K>>(res => {
      if (eventName === "loggedOn") console.log("createEventPromiseResolver.setting lastHandler")
      this.sac.setLastHandler(eventName, (...args) => res({ type: eventName, args }))
      // this.sac.client.on(eventName, (...args) => res({ type: eventName, args }))
    })
  }

  createTimeoutPromiseResolver(timeInSeconds: number) {
    return new Promise<SingleEventResolver<EventParametersTimeout, "timeout">>(res =>
      setTimeout(() => {
        res({ type: "timeout", args: [] })
      }, timeInSeconds * 1000).unref()
    )
  }

  getEventPromises(needEvent: EventPromises) {
    const promises: Array<Promise<FarmGamesEventsResolve<any>>> = []

    if (needEvent.loggedOn) {
      promises.push(this.createEventPromiseResolver("loggedOn"))
    }
    if (needEvent.steamGuard) {
      promises.push(this.createEventPromiseResolver("steamGuard"))
    }
    if (needEvent.error) {
      promises.push(this.createEventPromiseResolver("error"))
    }
    if (needEvent.timeout) {
      promises.push(this.createTimeoutPromiseResolver(this.timeoutLimitInSeconds))
    }

    return promises
  }
}
