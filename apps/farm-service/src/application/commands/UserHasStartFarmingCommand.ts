import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class UserHasStartFarmingCommand implements Command {
  operation: EventNames = "user-has-start-farming"
  planId: string
  userId: string

  constructor(props: { planId: string; userId: string }) {
    this.planId = props.planId
    this.userId = props.userId
  }
}
