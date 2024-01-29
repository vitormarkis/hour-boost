import { HttpClient } from "core"
import { UpdateStagingGamesUseCase } from "~/application/use-cases/UpdateStagingGamesUseCase"
import { only } from "~/utils/helpers"

export type UpdateStagingGamesControllerPayload = {
  accountName: string
  newGameList: number[]
  userId: string
}

interface IUpdateStagingGamesController {
  handle(...args: any[]): Promise<HttpClient.Response & { code: string }>
}

const moduleName = "UpdateStagingGamesController"
export class UpdateStagingGamesController implements IUpdateStagingGamesController {
  constructor(private readonly updateStagingGamesUseCase: UpdateStagingGamesUseCase) {}

  async handle({ accountName, userId, newGameList }: UpdateStagingGamesControllerPayload) {
    const [error] = await this.updateStagingGamesUseCase.execute({
      accountName,
      newGameList,
      userId,
    })

    if (error) {
      if (error.code === "[Staging-Games-List-Service]:STAGE-MORE-GAMES-THAN-PLAN-ALLOWS") {
        return only({
          json: {
            message:
              "Tentativa de atualizar staging games falhou. Tentou adicionar mais jogos do que seu plano permite.",
          },
          status: 403,
          code: error.code,
        })
      }

      console.log({
        [`error-updating-staging-games-${accountName}`]: error,
      })

      return only({
        json: { message: "Erro ao tentar atualizar staging games." },
        status: 400,
        code: `[${moduleName}]::${error.code}`,
      })
    }

    return only({
      json: {
        message: "Lista de staging games atualizada com sucesso.",
      },
      status: 200,
      code: "SUCCESS",
    })
  }
}
