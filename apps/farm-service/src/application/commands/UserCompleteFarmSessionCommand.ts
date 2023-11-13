import { PlanInfinity, PlanUsage, Usage } from "core"

import { Command } from "~/application/commands/Command"
import { EventNames } from "~/infra/queue"

type Payload = {
  usage: Usage
  username: string
  userId: string
  planId: string
}

export class UserCompleteFarmSessionCommand implements Command<Payload> {
  operation: EventNames = "user-complete-farm-session"
  usage: Usage
  username: string
  userId: string
  planId: string

  constructor(props: Payload) {
    this.usage = props.usage
    this.username = props.username
    this.userId = props.userId
    this.planId = props.planId
  }
}
