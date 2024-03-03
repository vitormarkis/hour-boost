import { ErrorOccuredOnSteamClientCommand } from "~/application/commands"
import { ScheduleAutoRestartUseCase } from "~/application/use-cases"
import { AUTO_RESTARTER_INTERVAL_IN_SECONDS } from "~/consts"
import { EventNames, Observer } from "~/infra/queue"
import { thisErrorShouldScheduleAutoRestarter } from "~/utils/shouldScheduleAutoRestater"

export class ScheduleAutoRestartHandler implements Observer {
  operation: EventNames = "error-occured-on-steam-client"

  constructor(private readonly scheduleAutoRestartUseCase: ScheduleAutoRestartUseCase) {}

  async notify({ accountName, errorEResult }: ErrorOccuredOnSteamClientCommand): Promise<void> {
    if (!thisErrorShouldScheduleAutoRestarter(errorEResult)) return
    const [failSchedulingAutoRestart] = await this.scheduleAutoRestartUseCase.execute({
      accountName,
      intervalInSeconds: AUTO_RESTARTER_INTERVAL_IN_SECONDS,
    })
    if (failSchedulingAutoRestart) console.log({ failSchedulingAutoRestart })
  }
}
