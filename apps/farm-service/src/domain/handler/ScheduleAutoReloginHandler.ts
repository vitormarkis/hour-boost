import { ErrorOccuredOnSteamClientCommand } from "~/application/commands"
import { ScheduleAutoReloginUseCase } from "~/application/use-cases"
import { EventNames, Observer } from "~/infra/queue"

export class ScheduleAutoReloginHandler implements Observer {
  operation: EventNames = "error-occured-on-steam-client"

  constructor(private readonly scheduleAutoReloginUseCase: ScheduleAutoReloginUseCase) {}

  async notify({ accountName, intervalInSeconds }: ErrorOccuredOnSteamClientCommand): Promise<void> {
    const [failSchedulingAutoRelogin] = await this.scheduleAutoReloginUseCase.execute({
      accountName,
      intervalInSeconds,
    })

    if (failSchedulingAutoRelogin) console.log("22:", { failSchedulingAutoRelogin })
  }
}
