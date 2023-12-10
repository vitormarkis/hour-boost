import { ApplicationError, UserIsAlreadyFarmingException, UserIsNotFarmingException, UsersRepository } from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"
import { HttpClient } from "~/contracts/HttpClient"
import { Publisher } from "~/infra/queue"
import { makeResError } from "~/utils"

export class StopFarmController {
  constructor(
    private readonly usersClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly publisher: Publisher,
    private readonly usersRepository: UsersRepository
  ) { }

  async handle(
    req: HttpClient.Request<{
      userId: string
      accountName: string
    }>
  ): Promise<HttpClient.Response> {
    try {
      const user = await this.usersRepository.getByID(req.payload.userId)
      if (!user) return { json: { message: "Usuário não encontrado." }, status: 404 }


      const userCluster = this.usersClusterStorage.get(user.username)
      if (!userCluster) throw new ApplicationError("Usuário não possui contas farmando.", 402)
      userCluster.pauseFarmOnAccount(req.payload.accountName)
      return { json: null, status: 200 }
    } catch (error) {
      if (error instanceof UserIsNotFarmingException) return makeResError(error, 400)
      console.log(error)
      return makeResError(error)
    }
  }
}
