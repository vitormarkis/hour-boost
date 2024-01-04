import {
  ApplicationError,
  Controller,
  HttpClient,
  PlanRepository,
  SteamAccountClientStateCacheRepository,
  UsersRepository,
} from "core"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { FarmGamesUseCase } from "~/application/use-cases/FarmGamesUseCase"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { Publisher } from "~/infra/queue"
import { SteamClientEventsRequired } from "~/presentation/controllers"
import { areTwoArraysEqual, makeRes } from "~/utils"

export namespace FarmGamesHandle {
  export type Payload = {
    accountName: string
    gamesID: number[]
    userId: string
  }

  export type Response = { message: string }
}

export class FarmGamesController implements Controller<FarmGamesHandle.Payload, FarmGamesHandle.Response> {
  private readonly publisher: Publisher
  private readonly usersRepository: UsersRepository
  private readonly allUsersClientsStorage: AllUsersClientsStorage
  private readonly usersClusterStorage: UsersSACsFarmingClusterStorage
  private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository
  private readonly farmGamesUseCase: FarmGamesUseCase

  constructor(props: FarmGamesControllerProps) {
    this.publisher = props.publisher
    this.usersRepository = props.usersRepository
    this.allUsersClientsStorage = props.allUsersClientsStorage
    this.usersClusterStorage = props.usersClusterStorage
    this.sacStateCacheRepository = props.sacStateCacheRepository
    this.farmGamesUseCase = props.farmGamesUseCase
  }

  async handle({ payload }: APayload): AResponse {
    const { accountName, gamesID, userId } = payload
    const user = await this.usersRepository.getByID(userId)
    if (!user) throw new ApplicationError("Usuário não encontrado.", 404)
    const steamAccountDomain = user.steamAccounts.data.find(sa => sa.credentials.accountName === accountName)
    if (!steamAccountDomain)
      throw new ApplicationError("Steam Account nunca foi registrada ou ela não pertence à você.", 400)

    const sac = this.allUsersClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username: user.username,
      planId: user.plan.id_plan,
    })
    if (!sac.logged) {
      sac.login(steamAccountDomain.credentials.accountName, steamAccountDomain.credentials.password)

      const steamClientEventsRequired = new SteamClientEventsRequired(sac, EVENT_PROMISES_TIMEOUT_IN_SECONDS)

      const eventsPromisesResolved = await Promise.race(
        steamClientEventsRequired.getEventPromises({
          loggedOn: true,
          steamGuard: true,
          error: true,
          timeout: true,
        })
      )

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

      if (eventsPromisesResolved.type === "steamGuard") {
        const [domain, setCode] = eventsPromisesResolved.args
        sac.setManualHandler("steamGuard", code => setCode(code))
        return makeRes(
          202,
          `Steam Guard requerido. Enviando para ${domain ? `e-mail com final ${domain}` : `seu celular.`}`
        )
      }

      // if (eventsPromisesResolved.type === "loggedOn") {
      //   await this.sacStateCacheRepository.init(sac.accountName)
      // }
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

    await this.farmGamesUseCase.execute({
      accountName,
      gamesId: gamesID,
      plan: user.plan,
      planId: user.plan.id_plan,
      sac,
      username: user.username,
    })

    return makeRes(200, "Iniciando farm.")
  }
}

type APayload = HttpClient.Request<FarmGamesHandle.Payload>
type AResponse = Promise<HttpClient.Response<FarmGamesHandle.Response>>

type FarmGamesControllerProps = {
  publisher: Publisher
  usersRepository: UsersRepository
  allUsersClientsStorage: AllUsersClientsStorage
  sacStateCacheRepository: SteamAccountClientStateCacheRepository
  usersClusterStorage: UsersSACsFarmingClusterStorage
  planRepository: PlanRepository
  farmGamesUseCase: FarmGamesUseCase
}
