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

export class FarmGamesController {
  constructor(
    private readonly farmingUsersStorage: IFarmingUsersStorage,
    private readonly publisher: Publisher,
    private readonly usersRepository: UsersRepository,
    private readonly userSteamClientsStorage: AllUsersClientsStorage
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
    const steamAccountDomain = user.steamAccounts.find(sa => sa.credentials.accountName === accountName)
    if (!steamAccountDomain) throw new ApplicationError("Steam Account não foi registrada.", 400)

    console.log({
      CHECKING: true,
    })

    const { steamAccountClient: sac } = this.userSteamClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username: user.username,
    })
    console.log({
      THIS_NEEDS_TO_BE_TRUE: sac,
    })
    if (!sac) throw new ApplicationError("Essa conta nunca se conectou à Steam.")
    if (!sac.logged) {
      sac.login(steamAccountDomain.credentials.accountName, steamAccountDomain.credentials.password)
      const { json, status } = await Promise.race([
        new Promise<Resolved>((res, rej) => {
          sac.client.on("loggedOn", async () => {
            res({
              json: null,
              status: 200,
            })
          })
        }),
        new Promise<Resolved>((res, rej) => {
          sac.client.on("steamGuard", (domain, setSteamCodeCallback) => {
            sac.setLastHandler(accountName, "steamGuard", setSteamCodeCallback)
            res({
              json: {
                message: `SteamClient: Steam Guard required! Sendind code to ${
                  domain ? `email ${domain}` : `your phone.`
                }`,
              },
              status: 202,
            })
          })
        }),
        new Promise<Resolved>((res, rej) => {
          sac.client.on("error", error => {
            res(getUSCErrorMessage(error))
          })
        }),
        getTimeoutPromise<Resolved>(EVENT_PROMISES_TIMEOUT_IN_SECONDS, {
          json: {
            message: "Server timed out.",
          },
          status: 400,
        }),
      ])
      if (json) {
        throw new ApplicationError(json.message ?? "Error with no json was thrown.", status)
      }
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
    sac.farmGames(gamesID)

    if (user.plan instanceof PlanInfinity) {
      const farmInfinityService = new FarmInfinityService(
        this.publisher,
        user.username,
        user.plan.id_plan,
        user.plan.ownerId
      )
      this.farmingUsersStorage.add(farmInfinityService).startFarm()
      return makeRes(200, "Iniciando farm.")
    }

    if (user.plan instanceof PlanUsage) {
      const farmUsageService = new FarmUsageService(this.publisher, user.plan, user.username)
      farmUsageService.farmWithAccount(accountName)
      this.farmingUsersStorage.add(farmUsageService).startFarm()
      return makeRes(200, "Iniciando farm.")
    }

    console.log({ plan: user.plan })
    throw new ApplicationError("Instância do plano do usuário não suportado.")
  }
}

function getUSCErrorMessage(error: EventParameters["error"][0]): Resolved {
  if (error.eresult === 18)
    return makeRes(
      404,
      "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente."
    )
  return makeRes(400, `Uncaught Steam Client Error: ${loginErrorMessages[error.eresult]}`)
}
