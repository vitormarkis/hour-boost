import type { SteamAccountsDAO } from "core"
import type { AutoRestartCron } from "~/application/cron/AutoRestartCron"
import { __recoveringAccounts } from "~/momentarily"
import { Logger } from "~/utils/Logger"
import { type ExecutePromisesInBatchProps, executePromisesInBatch } from "~/utils/executePromisesInBatch"
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
    allAccountNameList.forEach(accountName => __recoveringAccounts.add(accountName))
    const accountNameList = whitelistAccountNames
      ? allAccountNameList.filter(accName => whitelistAccountNames.includes(accName))
      : allAccountNameList

    this.logger.log({
      allAccountNameList,
      accountNameList,
    })

    const sessionRestart = getSessionRestart(this.autoRestartCron, accountNameList)

    await executePromisesInBatch({
      ...batchOptions,
      promiseList: sessionRestart,
    })

    return nice({
      promisesAmount: sessionRestart.length,
    })
  }
}

const getSessionRestart = (autoRestartCron: AutoRestartCron, accountNameList: string[]) => {
  return accountNameList.map(accountName => ({
    accountName,
    getPromise: async () => {
      const [errorAutoRestart, reslt] = await autoRestartCron.run({
        accountName,
        forceRestoreSessionOnApplication: true,
      })

      if (errorAutoRestart) {
        console.log({ errorAutoRestart })
        return bad(errorAutoRestart)
      }
      return nice(reslt)
    },
  }))
}

export type SessionRestart = ReturnType<typeof getSessionRestart>[number]
