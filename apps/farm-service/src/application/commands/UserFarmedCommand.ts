import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class UserFarmedCommand implements Command, UserFarmedCommandProps {
	operation: EventNames = "user-farmed"
	when: Date
	username: string
	amount: number

	constructor(props: UserFarmedCommandProps) {
		this.when = props.when
		this.username = props.username
		this.amount = props.amount
	}
}

interface UserFarmedCommandProps {
	when: Date
	username: string
	amount: number
}
