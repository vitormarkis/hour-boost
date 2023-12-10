import { UserPauseInfinityFarmSessionCommand } from "~/application/commands"
import { EventNames, Observer } from "~/infra/queue"

export class LogCompleteInfinityFarmSessionHandler implements Observer {
  operation: EventNames = "user-pause-infinity-farm-session-command"

  async notify(command: UserPauseInfinityFarmSessionCommand): Promise<void> {
    console.log(`${command.username} terminou uma infinity farm session.`)
  }
}
