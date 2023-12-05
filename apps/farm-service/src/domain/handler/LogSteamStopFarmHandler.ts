import { StopFarmingCommand } from "~/application/commands/steam-client"
import { logDate } from "~/domain/handler"
import { EventNames, Observer } from "~/infra/queue"

export class LogSteamStopFarmHandler implements Observer {
  operation: EventNames = "STEAMCLIENT:stop-farming"
  async notify({ when }: StopFarmingCommand): Promise<void> {
    console.log(`[steam-client:${logDate(when)}]: Stopping farm!`)
  }
}
