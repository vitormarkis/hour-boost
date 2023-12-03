import { UserHasStartFarmingCommand } from "~/application/commands"
import { EventNames, Observer } from "~/infra/queue"

export class StartFarmPlanHandler implements Observer {
	operation: EventNames = "user-has-start-farming"

	async notify(command: UserHasStartFarmingCommand): Promise<void> {
		console.log(`${command.userId} has started the farming.`)
	}
}
