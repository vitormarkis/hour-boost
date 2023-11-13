import { UsersRepository, PlanInfinity, PlanUsage } from "core"
import { FarmingUsersStorage, FarmInfinityService, FarmUsageService } from "~/application/services"
import { HttpClient } from "~/contracts/HttpClient"
import { Publisher } from "~/infra/queue"
import { makeResError } from "~/utils"

export class StopFarmController {
  constructor(
    private readonly farmingUsersStorage: FarmingUsersStorage,
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
      if (!user) return { json: { message: "User doesn't exists." }, status: 404 }

      const farmingUser = this.farmingUsersStorage.get(user.username)
      if (farmingUser?.status === "IDDLE") {
        return { status: 400, json: { message: "Usuário não está farmando." } }
      }

      if (user.plan instanceof PlanInfinity) {
        const farmInfinityService = new FarmInfinityService(
          this.publisher,
          user.username,
          user.plan.id_plan,
          user.plan.ownerId
        )
        this.farmingUsersStorage.add(farmInfinityService)
        // await new Promise(res => setTimeout(res, 1000))
        this.farmingUsersStorage.get(user.username)?.stopFarm()
        return { json: null, status: 200 }
      }

      if (user.plan instanceof PlanUsage) {
        const farmUsageService = new FarmUsageService(
          this.publisher,
          user.plan.getUsageLeft(),
          user.plan.id_plan,
          user.plan.ownerId,
          user.username
        )
        this.farmingUsersStorage.add(farmUsageService)
        // await new Promise(res => setTimeout(res, 1000))
        this.farmingUsersStorage.get(user.username)?.stopFarm()
        return { json: null, status: 200 }
      }

      console.log({ plan: user.plan })
      throw new Error("Instância do plano do usuário não suportado.")
    } catch (error) {
      console.log(error)
      return makeResError(error)
    }
  }
}
