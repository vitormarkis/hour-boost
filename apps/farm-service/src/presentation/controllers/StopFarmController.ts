import { ApplicationError, Controller, HttpClient, UsersRepository } from "core"
import { StopFarmUseCase } from "~/application/use-cases/StopFarmUseCase"

export namespace StopFarmHandle {
  export type Payload = {
    userId: string
    accountName: string
  }

  export type Response = null | { message: string }
}

export class StopFarmController implements Controller<StopFarmHandle.Payload, StopFarmHandle.Response> {
  constructor(
    private readonly stopFarmUseCase: StopFarmUseCase,
    private readonly usersRepository: UsersRepository
  ) {}

  async handle({ payload }: APayload) {
    const { userId, accountName } = payload
    const user = await this.usersRepository.getByID(userId)
    if (!user) return { json: { message: "Usuário não encontrado." }, status: 404 }

    const [errorPausingFarm] = await this.stopFarmUseCase.execute({
      accountName,
      planId: user.plan.id_plan,
      username: user.username,
    })

    if (errorPausingFarm instanceof ApplicationError) throw errorPausingFarm
    if (errorPausingFarm?.code === "PLAN-NOT-FOUND") {
      return {
        json: {
          message: `Plano com id [${errorPausingFarm.payload.givenPlanId}] não foi encontrado.`,
          code: errorPausingFarm.code,
        },
        status: errorPausingFarm.httpStatus,
      }
    }
    if (errorPausingFarm?.code === "[Users-Cluster-Storage]:CLUSTER-NOT-FOUND") {
      return {
        json: {
          message: "Aconteceu um erro, tente novamente mais tarde.",
          code: "ERROR",
        },
        status: 400,
      }
    }
    errorPausingFarm satisfies null
    return {
      json: {
        message: "Farm pausado com sucesso.",
        code: "SUCCESS",
      },
      status: 200,
    }
  }
}

type APayload = HttpClient.Request<StopFarmHandle.Payload>
