import type { RoleName } from "core"
import type jwt from "jsonwebtoken"

export const HBHeaders = {
  ["hb-identification"]: "hb-identification",
}

export namespace HBHeadersType {
  export namespace HBIdentification {
    export interface Data {
      role: RoleName
    }
    export interface JWTPayload extends jwt.JwtPayload, Data {}
  }
}
