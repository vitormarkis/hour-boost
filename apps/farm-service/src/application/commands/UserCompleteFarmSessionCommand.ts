import type { Command } from "~/application/commands"
import type { PauseFarmOnAccountUsage } from "~/application/services"
import type { EventNames } from "~/infra/queue"

export class UserCompleteFarmSessionCommand implements Command {
  operation: EventNames = "user-complete-farm-session"
  when: Date
  planId: string
  pauseFarmCategory: PauseFarmOnAccountUsage
  isFinalizingSession: boolean
  userId: string

  constructor(props: UserCompleteFarmSessionCommandProps) {
    this.when = props.when
    this.planId = props.planId
    this.pauseFarmCategory = props.pauseFarmCategory
    this.isFinalizingSession = props.isFinalizingSession
    this.userId = props.userId
  }
}

interface UserCompleteFarmSessionCommandProps {
  when: Date
  planId: string
  pauseFarmCategory: PauseFarmOnAccountUsage
  isFinalizingSession: boolean
  userId: string
}
