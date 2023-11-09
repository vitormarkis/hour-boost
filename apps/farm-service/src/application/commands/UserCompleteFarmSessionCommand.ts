import { Usage } from "core"
import { EventNames } from "../../domain/service/UserFarmService"
import { Command } from "./Command"

type Payload = {
  usage: Usage
  usageLeft: number
  username: string
}

export class UserCompleteFarmSessionCommand implements Command<Payload> {
  operation: EventNames = "user-complete-farm-session"
  usage: Usage
  usageLeft: number
  username: string

  constructor(props: Payload) {
    this.usage = props.usage
    this.usageLeft = props.usageLeft
    this.username = props.username
  }
}
