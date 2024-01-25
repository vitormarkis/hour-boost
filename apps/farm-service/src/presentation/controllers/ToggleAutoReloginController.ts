import { ApplicationError, DataOrFail, HttpClient } from "core"
import { ToggleAutoReloginUseCase } from "~/application/use-cases/ToggleAutoReloginUseCase"
import { makeRes } from "~/utils"
import { nice, only } from "~/utils/helpers"

export type ToggleAutoReloginControllerPayload = {
  planId: string
  accountName: string
  userId: string
}

interface IToggleAutoReloginController {
  handle(...args: any[]): Promise<HttpClient.Response & { code: string }>
}

export class ToggleAutoReloginController implements IToggleAutoReloginController {
  constructor(private readonly toggleAutoReloginUseCase: ToggleAutoReloginUseCase) {}

  async handle({ planId, accountName, userId }: ToggleAutoReloginControllerPayload) {
    const [error, result] = await this.toggleAutoReloginUseCase.execute({
      planId,
      accountName,
      userId,
    })

    if (error) {
      if (error.code === "PLAN_DOES_NOT_SUPPORT_AUTO_RELOGIN") {
        return only({
          json: { message: "Seu plano não permite o uso do auto-relogin." },
          status: 403,
          code: error.code,
        })
      }
      if (error.code === "PLAN_NOT_FOUND") {
        return only({ json: { message: "Plano não encontrado." }, status: 404, code: error.code })
      }
      if (error.code === "STEAM_ACCOUNT_NOT_FOUND") {
        return only({ json: { message: "Conta da steam não encontrada." }, status: 404, code: error.code })
      }
      if (error.code === "USER_ARE_NOT_ACCOUNT_OWNER") {
        return only({
          json: { message: "Essa conta da Steam não pertence a você." },
          status: 403,
          code: error.code,
        })
      }
      error satisfies never
      return only({ json: { message: "Erro desconhecido." }, status: 400, code: "UNKNOWN" })
    }

    return only({
      json: {
        message: result.newValue ? "Auto relogin ativado." : "Auto relogin desativado",
      },
      status: 200,
      code: "SUCCESS",
    })
  }
}
