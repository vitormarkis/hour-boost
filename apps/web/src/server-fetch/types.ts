import { UserSession } from "core"

export type UserSessionParams = {
  user: UserSession
  serverHeaders: Record<string, any>
}

export type UserSessionParamsBroad = {
  user: UserSession | null
  serverHeaders: Record<string, any>
}
