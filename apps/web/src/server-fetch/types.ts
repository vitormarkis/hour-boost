import { UserSession } from "core"

export type UserSessionParams = {
  user: UserSession
  serverHeaders: Record<string, any>
}
