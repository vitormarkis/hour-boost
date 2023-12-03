import { Usage } from "core"

import { Command } from "~/application/commands/Command"
import { EventNames } from "~/infra/queue"

type Payload = {
	usage: Usage
	username: string
	userId: string
	planId: string
	when: Date
	farmStartedAt: Date
}

export class UserCompleteFarmSessionCommand implements Command<Payload> {
	operation: EventNames = "user-complete-farm-session"
	when: Date
	usage: Usage
	username: string
	userId: string
	planId: string
	farmStartedAt: Date

	constructor(props: Payload) {
		this.when = props.when
		this.usage = props.usage
		this.username = props.username
		this.userId = props.userId
		this.planId = props.planId
		this.farmStartedAt = props.farmStartedAt
	}
}
