import { DataOrError, DataOrFail, Fail } from "core"
import { appendFile } from "fs"
import { AutoRestartCron } from "~/application/cron/AutoRestartCron"
import { AutoRestarterScheduler } from "~/domain/cron"
import { Logger } from "~/utils/Logger"
import { bad, nice } from "~/utils/helpers"

export type ScheduleAutoRestartPayload = {
  accountName: string
  intervalInSeconds?: number
}

interface IScheduleRestartRelogin {
  execute(...args: any[]): Promise<DataOrFail<Fail>>
}

export class ScheduleAutoRestartUseCase implements IScheduleRestartRelogin {
  private readonly logger = new Logger("schedule-auto-restart-use-case")

  constructor(
    private readonly autoRestarterScheduler: AutoRestarterScheduler,
    private readonly autoRestartCron: AutoRestartCron
  ) {}

  async execute({ accountName, intervalInSeconds = 60 * 10 }: ScheduleAutoRestartPayload) {
    this.logger.log(`Scheduling a cron for [${accountName}] to run every ${intervalInSeconds} seconds.`)
    const hasCronAlready = this.autoRestarterScheduler.alreadyHasCron(accountName)
    if (hasCronAlready) return bad(new Fail({ code: "ALREADY-HAS-CRON" }))

    const interval = setInterval(async () => {
      const [errorWhileRestarting, result] = await this.autoRestartCron.run({
        accountName,
      })

      appendFile(
        "logs/scheduler.txt",
        `${new Date().toISOString()} [${accountName}] ${JSON.stringify([errorWhileRestarting, result])} \r\n`,
        () => {}
      )
      if (errorWhileRestarting) {
        this.autoRestarterScheduler.stopCron(accountName)
        this.logger.log(`dismissing cron for account [${accountName}]`)

        if (errorWhileRestarting.code === "PLAN_NOT_FOUND") {
          this.logger.log(`plano não encontrado com id [${errorWhileRestarting.payload.planId}]`)
          return
        }
        if (errorWhileRestarting.code === "STEAM_ACCOUNT_IS_NOT_OWNED") {
          this.logger.log(`steam account não não tinha dono {${accountName}}`)
          return
        }
        if (errorWhileRestarting.code === "STEAM_ACCOUNT_NOT_FOUND") {
          this.logger.log(`steam account não foi encontrada {${accountName}}`)
          return
        }
        if (errorWhileRestarting.code === "USER_NOT_FOUND") {
          this.logger.log(`usuario não encontrado com id [${errorWhileRestarting.payload.user}]`)
          return
        }
        // errorWhileRestarting satisfies never
        return
      }

      if (result.fatal) {
        this.logger.log(`fatal, dismissing cron for account [${accountName}]`)
        this.autoRestarterScheduler.stopCron(accountName)
      }
    }, 1000 * intervalInSeconds)

    this.autoRestarterScheduler.addCron(accountName, interval)

    return nice()
  }
}
