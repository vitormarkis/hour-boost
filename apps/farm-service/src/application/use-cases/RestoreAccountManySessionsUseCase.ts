import { SteamAccountsDAO, UseCase } from "core"
import { AutoRestartCron } from "~/application/cron/AutoRestartCron"
import { Logger } from "~/utils/Logger"
import { ExecutePromisesInBatchProps, executePromisesInBatch } from "~/utils/executePromisesInBatch"
import { bad, nice } from "~/utils/helpers"

export type BatchOptions = Pick<
  ExecutePromisesInBatchProps,
  "batchAmount" | "noiseInSeconds" | "intervalInSeconds"
>

type RestoreAccountManySessionsUseCasePayload = {
  whitelistAccountNames?: string[]
  batchOptions: BatchOptions
}

export class RestoreAccountManySessionsUseCase {
  logger = new Logger("Restore-Account-Session")

  constructor(
    private readonly steamAccountsDAO: SteamAccountsDAO,
    private readonly autoRestartCron: AutoRestartCron
  ) {}

  async execute({ whitelistAccountNames, batchOptions }: RestoreAccountManySessionsUseCasePayload) {
    const allAccountNameList = await this.steamAccountsDAO.listAccountNames({
      filter: { onlyOwnedAccounts: true },
    })
    const accountNameList = whitelistAccountNames
      ? allAccountNameList.filter(accName => whitelistAccountNames.includes(accName))
      : allAccountNameList

    this.logger.log({
      allAccountNameList,
      accountNameList,
    })

    const sessionRestartPromises = accountNameList.map(accountName => async () => {
      const [errorAutoRestart, reslt] = await this.autoRestartCron.run({
        accountName,
        forceRestoreSessionOnApplication: true,
      })

      if (errorAutoRestart) {
        console.log({ errorAutoRestart })
        return bad(errorAutoRestart)
      }
      return nice(reslt)
    })

    await executePromisesInBatch({
      ...batchOptions,
      promiseList: sessionRestartPromises,
    })

    return nice({
      promisesAmount: sessionRestartPromises.length,
    })
  }
}
