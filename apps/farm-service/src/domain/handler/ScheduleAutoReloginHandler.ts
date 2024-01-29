import { ErrorOccuredOnSteamClientCommand } from "~/application/commands"
import { ScheduleAutoRestartUseCase } from "~/application/use-cases"
import {
  AUTO_RESTARTER_INTERVAL_IN_SECONDS,
  CLIENT_ERRORS_THAT_SHOULD_SCHEDULE_AUTO_RESTARTER,
} from "~/consts"
import { EventNames, Observer } from "~/infra/queue"

export class ScheduleAutoRestartHandler implements Observer {
  operation: EventNames = "error-occured-on-steam-client"

  constructor(private readonly scheduleAutoRestartUseCase: ScheduleAutoRestartUseCase) {}

  async notify({ accountName, errorEResult }: ErrorOccuredOnSteamClientCommand): Promise<void> {
    if (!CLIENT_ERRORS_THAT_SHOULD_SCHEDULE_AUTO_RESTARTER.includes(errorEResult)) return
    const [failSchedulingAutoRestart] = await this.scheduleAutoRestartUseCase.execute({
      accountName,
      intervalInSeconds: AUTO_RESTARTER_INTERVAL_IN_SECONDS,
    })

    if (failSchedulingAutoRestart) console.log({ failSchedulingAutoRestart })
  }
}
