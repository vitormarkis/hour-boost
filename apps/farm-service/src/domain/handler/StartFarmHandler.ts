import { UserHasStartFarmingCommand } from "~/application/commands"
import { EventNames, Observer } from "~/infra/queue"

export class StartFarmHandler implements Observer {
  operation: EventNames = "user-has-start-farming"

  async notify(command: UserHasStartFarmingCommand): Promise<void> {
    console.log(`${command.props.userId} has started the farming.`)
  }
}
