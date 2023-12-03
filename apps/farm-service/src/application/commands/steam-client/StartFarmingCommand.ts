import { Command } from "~/application/commands/Command"
import { EventNames } from "~/infra/queue"

interface StartFarmingCommandProps {
	when: Date
	gamesID: number[]
}

export class StartFarmingCommand implements Command {
	operation: EventNames = "STEAMCLIENT:start-farming"
	gamesID: number[]
	when: Date

	constructor(props: StartFarmingCommandProps) {
		this.when = props.when
		this.gamesID = props.gamesID
	}
}
