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

export class StartFarmController {
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
    if (!user) return { json: { message: "Usuário não encontrado." }, status: 404 }
    const steamAccountDomain = user.steamAccounts.find(sa => sa.credentials.accountName === accountName)
    if (!steamAccountDomain) throw new ApplicationError("Steam Account não foi registrada.", 400)
    const { userSteamClient: usc } = this.userSteamClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username: user.username,
    })
    if (gamesID.length === 0) return makeRes(200, "Farm pausado.")
    console.log({
      gamesID,
      gamesPlaying: usc.getGamesPlaying(),
    })
    const noNewGameAddToFarm = areTwoArraysEqual(gamesID, usc.getGamesPlaying())
    if (noNewGameAddToFarm) return makeRes(200, "Nenhum novo game adicionado ao farm.")
    if (!usc) throw new ApplicationError("This account never logged in.")
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
      console.log("IS PLAN USAGE")
      const farmUsageService = new FarmUsageService(this.publisher, user.plan, user.username)
      this.farmingUsersStorage.add(farmUsageService).startFarm()
      return makeRes(200, "Iniciando farm.")
    }

    console.log({ plan: user.plan })
    throw new ApplicationError("Instância do plano do usuário não suportado.")
  }
}
