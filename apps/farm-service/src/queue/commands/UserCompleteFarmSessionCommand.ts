import { Usage } from "core"
import { EventNames } from "../../UserFarmService"

export class UserCompleteFarmSessionCommand {
  name: EventNames = "user-complete-farm-session"

  constructor(
    readonly props: {
      id_user: string
      username: string
      usageLeft: number
      planId: string
      usage: Usage
    }
  ) {}
}
