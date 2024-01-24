import { ApplicationError, DataOrError, SteamAccountsRepository, UsersDAO } from "core"
import { AllUsersClientsStorage } from "~/application/services"
import {
  CronResult,
  RestoreAccountSessionUseCase,
} from "~/application/use-cases/RestoreAccountSessionUseCase"
import { Logger } from "~/utils/Logger"
import { nice, fail } from "~/utils/helpers"

interface IAutoReloginScheduler {
  alreadyHasCron(key: string): boolean
  stopCron(key: string): DataOrError<undefined>
  addCron(key: string, cron: NodeJS.Timeout): void
}

export class AutoReloginScheduler implements IAutoReloginScheduler {
  private autoRelogins: Map<string, NodeJS.Timeout> = new Map()
  private readonly logger = new Logger("AutoReloginScheduler")

  constructor() {}
  listCronsKeys() {
    return Array.from(this.autoRelogins.keys())
  }

  addCron(key: string, cron: NodeJS.Timeout): void {
    this.logger.log("adding cron for this key", key)
    this.autoRelogins.set(key, cron.unref())
  }

  alreadyHasCron(key: string): boolean {
    return this.autoRelogins.has(key)
  }

  stopCron(key: string) {
    this.logger.log(`cleaning cron for [${key}]`)
    const autoRelogin = this.autoRelogins.get(key)
    if (!autoRelogin) {
      return fail(
        new ApplicationError(
          "Tried to stop a cron that has never been added.",
          404,
          undefined,
          "CRON-NOT-FOUND"
        )
      )
    }
    clearInterval(autoRelogin)
    this.autoRelogins.delete(key)
    return nice()
  }
}

export type ScheduleAutoReloginPayload = {
  accountName: string
  intervalInSeconds?: number
}

interface IScheduleAutoRelogin {
  execute(...args: any[]): Promise<DataOrError<undefined>>
}

export class ScheduleAutoRelogin implements IScheduleAutoRelogin {
  private readonly logger = new Logger("ScheduleAutoRelogin")

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

// new ScheduleAutoRelogin().execute().then(res => {
//   const [error, result] = res
// })
