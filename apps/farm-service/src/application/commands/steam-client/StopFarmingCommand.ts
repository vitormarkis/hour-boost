import { Command } from "~/application/commands/Command"
import { EventNames } from "~/infra/queue"

interface StopFarmingCommandProps {
	when: Date
}

export class StopFarmingCommand implements Command {
	operation: EventNames = "STEAMCLIENT:stop-farming"
	when: Date

	constructor(props: StopFarmingCommandProps) {
		this.when = props.when
	}
}
