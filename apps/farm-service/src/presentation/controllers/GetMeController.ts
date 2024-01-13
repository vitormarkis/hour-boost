import { Controller, GetUser, HttpClient, UserSession, UsersRepository } from "core"
import { CreateUserUseCase } from "~/application/use-cases/CreateUserUseCase"
import { makeRes, makeResError } from "~/utils"

export namespace GetMeHandle {
  export type Payload = {
    userId: string | null
  }

  export type Response = null | { message: string } | UserSession
}

export class GetMeController implements Controller<GetMeHandle.Payload, GetMeHandle.Response> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUser: GetUser
  ) {}

  async handle({ payload }: APayload): AResponse {
    try {
      const { userId } = payload
      if (!userId) return { json: null, status: 200 }
      const user = await this.usersRepository.getByID(userId)
      if (!user) {
        await this.createUserUseCase.execute(userId)
      }
      const userSession = await this.getUser.execute(userId)
      if (!userSession) return makeRes(500, "Something went wrong during the creation of your user.")
      return {
        json: {
          ...userSession,
        },
        status: 201,
      }
    } catch (error) {
      console.log(error)
      return makeResError(error)
    }
  }
}

type APayload = HttpClient.Request<GetMeHandle.Payload>
type AResponse = Promise<HttpClient.Response<GetMeHandle.Response>>
