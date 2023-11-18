import { UsersRepository, UserIsAlreadyFarmingException, UserIsNotFarmingException } from "core"
import { IFarmingUsersStorage } from "~/application/services"
import { HttpClient } from "~/contracts/HttpClient"
import { Publisher } from "~/infra/queue"
import { makeResError } from "~/utils"

export class StopFarmController {
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

      const { stopFarm } = this.farmingUsersStorage.remove(user.username)
      stopFarm()
      return { json: null, status: 200 }
    } catch (error) {
      if (error instanceof UserIsNotFarmingException) return makeResError(error, 400)
      console.log(error)
      return makeResError(error)
    }
  }
}
