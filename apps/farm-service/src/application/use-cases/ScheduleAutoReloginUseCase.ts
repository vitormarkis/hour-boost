import { ApplicationError, DataOrError } from "core"
import { CronResult, RestoreAccountSessionUseCase } from "~/application/use-cases"
import { AutoReloginScheduler } from "~/domain/cron"
import { Logger } from "~/utils/Logger"
import { fail, nice } from "~/utils/helpers"

export type ScheduleAutoReloginPayload = {
  accountName: string
  intervalInSeconds?: number
}

interface IScheduleAutoRelogin {
  execute(...args: any[]): Promise<DataOrError<undefined>>
}

export class ScheduleAutoReloginUseCase implements IScheduleAutoRelogin {
  private readonly logger = new Logger("ScheduleAutoReloginUseCase")

  constructor(
    private readonly autoReloginScheduler: AutoReloginScheduler,
    private readonly restoreAccountSessionUseCase: RestoreAccountSessionUseCase
  ) {}

  async execute({ accountName, intervalInSeconds = 60 * 10 }: ScheduleAutoReloginPayload) {
    if (this.autoReloginScheduler.alreadyHasCron(accountName)) {
      return fail(
        new ApplicationError(
          "Account already has auto relogin scheduled.",
          403,
          undefined,
          "ALREADY-HAS-CRON"
        )
      )
    }

    console.log(`1/2 setting internval for [${accountName}]`)
    console.log(`intervalo de ${intervalInSeconds} segundos`)

    const interval = setInterval(async () => {
      console.log(`2/2 trying to restore [${accountName}]`)
      const [errorRestoringSession, restoreSessionResult] = await this.restoreAccountSessionUseCase.execute({
        accountName,
      })

      if (errorRestoringSession) {
        this.logger.log("stopping the cron. ", errorRestoringSession.code)
        this.autoReloginScheduler.stopCron(accountName)

        if (errorRestoringSession instanceof CronResult) {
          switch (errorRestoringSession.code) {
            case "KNOWN-ERROR":
            case "OTHER-SESSION-STILL-ON":
            case "STEAM-GUARD":
            // 22: add code de pedir steam guard no cache
            case "UNKNOWN-CLIENT-ERROR":
          }
          return
        }
        if (errorRestoringSession instanceof ApplicationError) {
          switch (errorRestoringSession.code) {
            case "ACCOUNT_NOT_ASSIGNED_TO_ANYONE":
            case "ACCOUNT_NOT_FOUND":
            case "USER_NOT_FOUND":
          }
          return
        }
        errorRestoringSession satisfies never
        return
      }

      const { code, stopCron } = restoreSessionResult

      if (stopCron) {
        this.logger.log("stopping the cron. ", code)
        this.autoReloginScheduler.stopCron(accountName)
      }
    }, 1000 * intervalInSeconds).unref()

    this.autoReloginScheduler.addCron(accountName, interval)

    return nice()
  }
}
