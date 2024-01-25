import { ApplicationError, DataOrError } from "core"
import { Logger } from "~/utils/Logger"
import { fail, nice } from "~/utils/helpers"

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

// new ScheduleAutoRelogin().execute().then(res => {
//   const [error, result] = res
// })
