import { ApplicationError, DataOrError } from "core"
import { Logger } from "~/utils/Logger"
import { bad, nice } from "~/utils/helpers"

interface IAutoRestarterScheduler {
  alreadyHasCron(key: string): boolean
  stopCron(key: string): DataOrError<undefined>
  addCron(key: string, cron: NodeJS.Timeout): void
}

export class AutoRestarterScheduler implements IAutoRestarterScheduler {
  private autoRestarts: Map<string, NodeJS.Timeout> = new Map()
  private readonly logger = new Logger("AutoRestartScheduler")

  constructor() {}
  listCronsKeys() {
    return Array.from(this.autoRestarts.keys())
  }

  addCron(key: string, cron: NodeJS.Timeout): void {
    this.logger.log("adding cron for this key", key)
    this.autoRestarts.set(key, cron.unref())
  }

  alreadyHasCron(key: string): boolean {
    return this.autoRestarts.has(key)
  }

  stopCron(key: string) {
    this.logger.log(`cleaning cron for [${key}]`)
    const autoRestart = this.autoRestarts.get(key)
    if (!autoRestart) {
      return bad(
        new ApplicationError(
          "Tried to stop a cron that has never been added.",
          404,
          undefined,
          "CRON-NOT-FOUND"
        )
      )
    }
    clearInterval(autoRestart)
    this.autoRestarts.delete(key)
    return nice()
  }
}

// new ScheduleAutoRestart().execute().then(res => {
//   const [error, result] = res
// })
