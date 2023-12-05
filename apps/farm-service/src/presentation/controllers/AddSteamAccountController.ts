import { AddSteamAccount, ApplicationError, IAddSteamAccount, UsersDAO } from "core"
import { EResult } from "steam-user"
import { AllUsersClientsStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { SteamBuilder } from "~/contracts"

import { HttpClient } from "~/contracts/HttpClient"
import { Publisher } from "~/infra/queue"
import { EventParameters } from "~/infra/services"
import {
  EventMapperGeneric,
  EventParametersTimeout,
  FarmGamesEventsGenericResolve,
  FarmGamesEventsResolve,
  SingleEventResolver,
} from "~/presentation/controllers/FarmGamesController"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { getTimeoutPromise, makeRes, throwBadEventsResolved } from "~/utils"

export type Resolved = {
  json:
    | ({
        message: string
      } & Record<string, any>)
    | null
  status: number
}
export class AddSteamAccountController {
  constructor(
    private readonly addSteamAccount: AddSteamAccount,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersDAO: UsersDAO,
    private readonly steamBuilder: SteamBuilder,
    private readonly publisher: Publisher
  ) {}

  async handle(req: HttpClient.Request<IAddSteamAccount>): Promise<HttpClient.Response> {
    const perform = async () => {
      const { accountName, password, userId } = req.payload
      const { username } = (await this.usersDAO.getUsername(userId)) ?? {}
      if (!username) throw new ApplicationError("No user found with this ID.")

      const sac = new SteamAccountClient({
        props: {
          client: this.steamBuilder.create(),
          userId,
          username,
          accountName,
        },
        instances: {
          publisher: this.publisher,
        },
      })

      // sac.setLastHandler("loggedOn", () => {
      // 	console.log("sem handler")
      // })
      sac.login(accountName, password)

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
