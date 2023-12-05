import { CreateUser, GetUser, UserSession, UsersRepository } from "core"

import { HttpClient } from "~/contracts/HttpClient"
import { makeRes, makeResError } from "~/utils"

export class GetMeController {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createUser: CreateUser,
    private readonly getUser: GetUser
  ) {}

  async handle(
    req: HttpClient.Request<{
      userId: string | null
    }>
  ): Promise<HttpClient.Response> {
    try {
      const { userId } = req.payload
      if (!userId) return { json: null, status: 200 }
      const user = await this.usersRepository.getByID(userId)
      if (!user) await this.createUser.execute(userId)
      const userSession = await this.getUser.execute(userId)
      if (!userSession) return makeRes(500, "Something went wrong during the creation of your user.")
      return {
        json: {
          ...userSession,
        } as UserSession,
        status: 201,
      }
    } catch (error) {
      console.log(error)
      return makeResError(error)
    }
  }
}
