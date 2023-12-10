import {
  ApplicationError,
  UserIsAlreadyFarmingException,
  UserIsNotFarmingException,
  UsersRepository,
} from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"
import { HttpClient } from "~/contracts/HttpClient"
import { Publisher } from "~/infra/queue"
import { makeResError } from "~/utils"

export class StopFarmController {
  constructor(
    private readonly usersClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly usersRepository: UsersRepository
  ) {}

  async handle(
    req: HttpClient.Request<{
      userId: string
      accountName: string
    }>
  ): Promise<HttpClient.Response> {
    const user = await this.usersRepository.getByID(req.payload.userId)
    if (!user) return { json: { message: "Usuário não encontrado." }, status: 404 }

    const userCluster = this.usersClusterStorage.get(user.username)
    if (!userCluster) throw new ApplicationError("Usuário não possui contas farmando.", 402)
    userCluster.pauseFarmOnAccount(req.payload.accountName)
    // console.log({
    //   accountName: req.payload.accountName,
    //   getAccountsStatus: userCluster.getAccountsStatus()
    // })
    return { json: null, status: 200 }
  }
}
