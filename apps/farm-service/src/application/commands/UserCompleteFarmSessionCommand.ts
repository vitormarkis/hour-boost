import { Usage } from "core"

import { Command } from "~/application/commands/Command"
import { EventNames } from "~/infra/queue"

type Payload = {
  usage: Usage
  username: string
  userId: string
}

export class UserCompleteFarmSessionCommand implements Command<Payload> {
  operation: EventNames = "user-complete-farm-session"
  usage: Usage
  username: string
  userId: string

  constructor(props: Payload) {
    this.usage = props.usage
    this.username = props.username
    this.userId = props.userId
  }
}
