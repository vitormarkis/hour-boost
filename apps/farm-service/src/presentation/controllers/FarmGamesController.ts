import {
  ApplicationError,
  PlanInfinity,
  PlanUsage,
  UserIsAlreadyFarmingException,
  UsersRepository,
} from "core"

import { HttpClient } from "~/contracts/HttpClient"
import {
  FarmInfinityService,
  FarmUsageService,
  IFarmingUsersStorage,
  AllUsersClientsStorage,
} from "~/application/services"
import { Publisher } from "~/infra/queue"
import { areTwoArraysEqual, getTimeoutPromise, makeRes, makeResError } from "~/utils"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { Resolved } from "~/presentation/controllers/AddSteamAccountController"
import { loginErrorMessages } from "~/presentation/routes"
import { EventParameters } from "~/infra/services/SteamUserMock"
import { throwBadEventsResolved } from "~/utils/bad-events-handler/throwBadEventsResolved"

export class FarmGamesController {
  constructor(
    private readonly farmingUsersStorage: IFarmingUsersStorage,
    private readonly publisher: Publisher,
    private readonly usersRepository: UsersRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage
  ) {}

  async handle(
    req: HttpClient.Request<{
      userId: string
      gamesID: number[]
      accountName: string
    }>
  ): Promise<HttpClient.Response> {
    const { accountName, gamesID, userId } = req.payload
    const user = await this.usersRepository.getByID(req.payload.userId)
    if (!user) throw new ApplicationError("Usuário não encontrado.", 404)
    const steamAccountDomain = user.steamAccounts.data.find(sa => sa.credentials.accountName === accountName)
    if (!steamAccountDomain)
      throw new ApplicationError("Steam Account nunca foi registrada ou ela não pertence à você.", 400)

    const { steamAccountClient: sac } = this.allUsersClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username: user.username,
    })
    console.log(this.allUsersClientsStorage.listUsers())
    if (!sac) throw new ApplicationError("Essa conta nunca se conectou à Steam.")
    if (!sac.logged) {
      sac.login(steamAccountDomain.credentials.accountName, steamAccountDomain.credentials.password)
      const eventsPromisesResolved = await Promise.race([
        new Promise<FarmGamesEventsResolve>((res, rej) => {
          sac.client.on("loggedOn", (...args) => {
            res({ type: "loggedOn", args })
          })
        }),
        new Promise<FarmGamesEventsResolve>((res, rej) => {
          sac.client.on("steamGuard", (...args) => {
            res({ type: "steamGuard", args })
          })
        }),
        new Promise<FarmGamesEventsResolve>((res, rej) => {
          sac.client.on("error", (...args) => {
            res({ type: "error", args })
          })
        }),
        getTimeoutPromise<FarmGamesEventsResolve>(EVENT_PROMISES_TIMEOUT_IN_SECONDS, {
          type: "timeout",
          args: [],
        } as FarmGamesEventsResolve),
      ])

      const badEvents = throwBadEventsResolved(eventsPromisesResolved)
      if (badEvents.eventName === "steamGuard") {
        const [_, setCode] = badEvents.args
        sac.setLastHandler(accountName, "steamGuard", setCode)
      }
      if (badEvents.interrupt) return badEvents.httpResponse
    }
    if (gamesID.length === 0) {
      throw new ApplicationError("Você não pode farmar 0 jogos, começe o farm a partir de 1.", 403)
    }
    if (gamesID.length > user.plan.maxGamesAllowed) {
      const hasS = user.plan.maxGamesAllowed > 1 ? "s" : ""
      throw new ApplicationError(
        `Seu plano não permite o farm de mais do que ${user.plan.maxGamesAllowed} jogo${hasS} por vez.`,
        403
      )
    }
    const noNewGameAddToFarm = areTwoArraysEqual(gamesID, sac.getGamesPlaying())
    if (noNewGameAddToFarm) return makeRes(200, "Nenhum novo game adicionado ao farm.")

    if (user.plan instanceof PlanInfinity) {
      const farmInfinityService = new FarmInfinityService(
        this.publisher,
        user.username,
        user.plan.id_plan,
        user.plan.ownerId
      )
      this.farmingUsersStorage.add(farmInfinityService).startFarm()
      sac.farmGames(gamesID)
      return makeRes(200, "Iniciando farm.")
    }

    if (user.plan instanceof PlanUsage) {
      const farmUsageService = new FarmUsageService(this.publisher, user.plan, user.username)
      farmUsageService.farmWithAccount(accountName)
      this.farmingUsersStorage.add(farmUsageService).startFarm()
      sac.farmGames(gamesID)
      return makeRes(200, "Iniciando farm.")
    }

    throw new ApplicationError("Instância do plano do usuário não suportado.")
  }
}

export type EventMapperGeneric = Record<string, any[]>

export type FarmGamesEventsResolve<
  EventMapper extends EventMapperGeneric = EventParameters & EventParametersTimeout,
> = {
  [K in keyof EventMapper]: {
    type: K
    args: EventMapper[K]
  }
}[keyof EventMapper]

export type EventParametersTimeout = {
  timeout: []
}
