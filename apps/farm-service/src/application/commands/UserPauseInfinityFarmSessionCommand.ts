import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class UserPauseInfinityFarmSessionCommand implements Command {
  operation: EventNames = "user-pause-infinity-farm-session-command"

  constructor(
    readonly props: {
      username: string
    }
  ) {}
}
