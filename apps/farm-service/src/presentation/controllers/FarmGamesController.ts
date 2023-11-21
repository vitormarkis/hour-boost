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
  UserSteamClientsStorage,
} from "~/application/services"
import { Publisher } from "~/infra/queue"
import { areTwoArraysEqual, makeRes, makeResError } from "~/utils"

export class FarmGamesController {
  constructor(
    private readonly farmingUsersStorage: IFarmingUsersStorage,
    private readonly publisher: Publisher,
    private readonly usersRepository: UsersRepository,
    private readonly userSteamClientsStorage: UserSteamClientsStorage
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
    const { userSteamClient: usc } = this.userSteamClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username: user.username,
    })
    if (!usc) throw new ApplicationError("Essa conta nunca se conectou à Steam.")
    if (!usc.logged) {
      // logic to get credentials and log in again
      throw new ApplicationError("Seu client não está conectado à Steam, falha em reconectar.")
    }
    if (gamesID.length === 0) {
      throw new ApplicationError("Você não pode farmar 0 jogos, começe o farm a partir de 1.", 403)
    }
    const noNewGameAddToFarm = areTwoArraysEqual(gamesID, usc.getGamesPlaying())
    if (noNewGameAddToFarm) return makeRes(200, "Nenhum novo game adicionado ao farm.")
    usc.farmGames(gamesID)

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
      this.farmingUsersStorage.add(farmUsageService).startFarm()
      return makeRes(200, "Iniciando farm.")
    }

    console.log({ plan: user.plan })
    throw new ApplicationError("Instância do plano do usuário não suportado.")
  }
}
