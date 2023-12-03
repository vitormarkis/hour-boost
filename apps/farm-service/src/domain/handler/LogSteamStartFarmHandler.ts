import { StartFarmingCommand } from "~/application/commands/steam-client/StartFarmingCommand"
import { EventNames, Observer } from "~/infra/queue"

export class LogSteamStartFarmHandler implements Observer {
	operation: EventNames = "STEAMCLIENT:start-farming"
	async notify({ when }: StartFarmingCommand): Promise<void> {
		console.log(`[steam-client:${logDate(when)}]: Starting farm!`)
	}
}

export function logDate(date: Date) {
	const [day, hour] = date.toISOString().slice(8, 19).split("T")
	return `Day: ${day}, ${hour}`
}
