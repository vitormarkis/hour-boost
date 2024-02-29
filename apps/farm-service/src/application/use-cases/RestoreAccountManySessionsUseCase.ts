import { SteamAccountsDAO, UseCase } from "core"
import { AutoRestartCron } from "~/application/cron/AutoRestartCron"
import { Logger } from "~/utils/Logger"
import { nice } from "~/utils/helpers"

type RestoreAccountManySessionsUseCasePayload = Partial<{
  whitelistAccountNames: string[]
}>

export class RestoreAccountManySessionsUseCase {
  logger = new Logger("Restore-Account-Session")

  constructor(
    private readonly steamAccountsDAO: SteamAccountsDAO,
    private readonly autoRestartCron: AutoRestartCron
  ) {}

  async execute({ whitelistAccountNames } = {} as RestoreAccountManySessionsUseCasePayload) {
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

    const sessionRestartPromises = accountNameList.map(async accountName => {
      const [errorAutoRestart] = await this.autoRestartCron.run({
        accountName,
        forceRestoreSessionOnApplication: true,
      })
      if (errorAutoRestart) {
        console.log(`error restoring session [${accountName}]: `, errorAutoRestart)
      }
    })

    await Promise.all(sessionRestartPromises)

    return nice()
  }
}
