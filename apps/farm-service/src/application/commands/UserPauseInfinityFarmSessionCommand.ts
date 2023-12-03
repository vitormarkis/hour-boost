import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

interface UserPauseInfinityFarmSessionCommandProps {
	username: string
	when: Date
}

export class UserPauseInfinityFarmSessionCommand implements Command {
	operation: EventNames = "user-pause-infinity-farm-session-command"
	when: Date
	username: string

	constructor(readonly props: UserPauseInfinityFarmSessionCommandProps) {
		this.when = props.when
		this.username = props.username
	}
}
