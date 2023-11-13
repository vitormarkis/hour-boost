import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class UserHasStartFarmingCommand implements Command {
  operation: EventNames = "user-has-start-farming"

  constructor(
    readonly props: {
      planId: string
      userId: string
    }
  ) {}
}
