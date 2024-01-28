import { ErrorOccuredOnSteamClientCommand } from "~/application/commands"
import { ScheduleAutoRestartUseCase } from "~/application/use-cases"
import { EventNames, Observer } from "~/infra/queue"

export class ScheduleAutoRestartHandler implements Observer {
  operation: EventNames = "error-occured-on-steam-client"

  constructor(private readonly scheduleAutoRestartUseCase: ScheduleAutoRestartUseCase) {}

  async notify({ accountName, intervalInSeconds }: ErrorOccuredOnSteamClientCommand): Promise<void> {
    const [failSchedulingAutoRestart] = await this.scheduleAutoRestartUseCase.execute({
      accountName,
      intervalInSeconds,
    })

    if (failSchedulingAutoRestart) console.log({ failSchedulingAutoRestart })
  }
}
