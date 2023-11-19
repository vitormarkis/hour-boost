import {
  ApplicationError,
  PlanInfinity,
  PlanUsage,
  UserIsAlreadyFarmingException,
  UsersRepository,
} from "core"

import { HttpClient } from "~/contracts/HttpClient"
import { FarmInfinityService, FarmUsageService, IFarmingUsersStorage } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { makeResError } from "~/utils"

export class StartFarmController {
  constructor(
    private readonly farmingUsersStorage: IFarmingUsersStorage,
    private readonly publisher: Publisher,
    private readonly usersRepository: UsersRepository
  ) {}

  async handle(
    req: HttpClient.Request<{
      userId: string
    }>
  ): Promise<HttpClient.Response> {
    try {
      const user = await this.usersRepository.getByID(req.payload.userId)
      if (!user) return { json: { message: "Usuário não encontrado." }, status: 404 }

      if (user.plan instanceof PlanInfinity) {
        const farmInfinityService = new FarmInfinityService(
          this.publisher,
          user.username,
          user.plan.id_plan,
          user.plan.ownerId
        )
        this.farmingUsersStorage.add(farmInfinityService).startFarm()
        return { json: null, status: 200 }
      }

      if (user.plan instanceof PlanUsage) {
        const farmUsageService = new FarmUsageService(this.publisher, user.plan, user.username)
        this.farmingUsersStorage.add(farmUsageService).startFarm()
        return { json: null, status: 200 }
      }

      console.log({ plan: user.plan })
      throw new ApplicationError("Instância do plano do usuário não suportado.")
    } catch (error) {
      console.log(error)
      if (error instanceof UserIsAlreadyFarmingException) return makeResError(error, 400)
      return makeResError(error)
    }
  }
}
