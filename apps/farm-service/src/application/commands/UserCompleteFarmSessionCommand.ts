import { Command } from "~/application/commands"
import { PauseFarmOnAccountUsage } from "~/application/services"
import { EventNames } from "~/infra/queue"

export class UserCompleteFarmSessionCommand implements Command {
  operation: EventNames = "user-complete-farm-session"
  when: Date
  planId: string
  pauseFarmCategory: PauseFarmOnAccountUsage
  killSession: boolean

  constructor(props: UserCompleteFarmSessionCommandProps) {
    this.when = props.when
    this.planId = props.planId
    this.pauseFarmCategory = props.pauseFarmCategory
    this.killSession = props.killSession
  }
}

interface UserCompleteFarmSessionCommandProps {
  when: Date
  planId: string
  pauseFarmCategory: PauseFarmOnAccountUsage
  killSession: boolean
}
