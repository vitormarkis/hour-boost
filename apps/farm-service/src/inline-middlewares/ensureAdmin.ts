import type { DataOrFail, } from "core"
import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { bad, nice } from "~/utils/helpers"
import { safer } from "~/utils/safer"
import { HBHeaders, type HBHeadersType } from "./hb-headers-enum"
import { MiddlewareResponse } from "./middleware-reponse"

export async function ensureAdmin(req: Request, res: Response) {
  const hbIdentification = req.headers[HBHeaders["hb-identification"]] as string

  if (!hbIdentification) {
    return bad(
      new MiddlewareResponse({
        code: "NO-HB-IDENTIFICATION-HEADER-PROVIDED",
        status: 400,
        json: {
          message: "Nenhum header Hourboost de identificação foi enviado.",
        },
      })
    )
  }
  const [error, result] = safer(() => jwt.verify(hbIdentification, process.env.TOKEN_IDENTIFICATION_HASH!))
  if (error) {
    return bad(
      new MiddlewareResponse({
        code: "ERROR-VERIFYING-HB-IDENTIFICATION-TOKEN",
        status: 400,
        json: {
          message: "Erro ao decodificar token de identificação Hourboost.",
          givenToken: hbIdentification,
          errorMessage: error.message === "jwt malformed" ? "Token não atende formato JWT." : error.message,
        },
      })
    )
  }

  const { role } = result as HBHeadersType.HBIdentification.JWTPayload
  if (role !== "ADMIN") {
    return bad(
      new MiddlewareResponse({
        code: "USER-IS-NOT-ADMIN",
        status: 403,
        json: {
          userRole: role,
        },
      })
    )
  }

  return nice(true)
}

export type EnsureAdminContract = (
  req: Request,
  res: Response
) => Promise<DataOrFail<MiddlewareResponse<string, number>, true>>

export type EnsureAdmin = typeof ensureAdmin

ensureAdmin satisfies EnsureAdminContract
