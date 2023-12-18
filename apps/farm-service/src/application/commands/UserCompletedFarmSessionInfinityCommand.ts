import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class UserCompletedFarmSessionInfinityCommand implements Command {
  operation: EventNames = "user-complete-farm-session-infinity"
  when: Date
  planId: string
  accountName: string
  startedAt: Date

  constructor(props: UserCompletedFarmSessionUsageCommandProps) {
    this.when = props.when
    this.planId = props.planId
    this.accountName = props.accountName
    this.startedAt = props.startedAt
  }
}

interface UserCompletedFarmSessionUsageCommandProps {
  when: Date
  planId: string
  accountName: string
  startedAt: Date
}
