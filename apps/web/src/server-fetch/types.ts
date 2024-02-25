import { UserSession } from "core"

export type UserSessionParams = {
  user: UserSession
}

export type UserSessionParamsBroad = {
  user: UserSession | null
}
