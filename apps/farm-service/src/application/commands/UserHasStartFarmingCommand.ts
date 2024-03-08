import type { Command } from "~/application/commands"
import type { EventNames } from "~/infra/queue"

interface UserHasStartFarmingCommandProps {
  planId: string
  userId: string
  when: Date
}

export class UserHasStartFarmingCommand implements Command {
  operation: EventNames = "user-has-start-farming"
  when: Date
  planId: string
  userId: string

  constructor(props: UserHasStartFarmingCommandProps) {
    this.when = props.when
    this.planId = props.planId
    this.userId = props.userId
  }
}
