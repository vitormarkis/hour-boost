import { PlanRepository, SteamAccountClientStateCacheRepository, SteamAccountsDAO, UseCase } from "core"
import { AutoRestartCron } from "~/application/cron/AutoRestartCron"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { RetrieveSessionListUseCase } from "~/application/use-cases/RetrieveSessionListUseCase"
import { Logger } from "~/utils/Logger"

export namespace RestoreAccountSessionsUseCaseHandle {
  export type Payload = Partial<{
    whitelistAccountNames: string[]
  }>

  export type Response = void
}

export class RestoreAccountSessionsUseCase
  implements
    UseCase<RestoreAccountSessionsUseCaseHandle.Payload, RestoreAccountSessionsUseCaseHandle.Response>
{
  logger = new Logger("Restore-Account-Session")

  constructor(
    private readonly steamAccountsDAO: SteamAccountsDAO,
    private readonly autoRestartCron: AutoRestartCron
  ) {}

  async execute({ whitelistAccountNames }: APayload = {} as APayload): AResponse {
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

    // for (const session of sessions) {
    //   if (!session) continue
    //   const { accountName, refreshToken, userId, username, planId } = session
    //   const plan = await this.planRepository.getById(planId)
    //   if (!plan) {
    //     console.log(
    //       `[NSTH]: Plano não encontrado com id [${planId}]; username: [${username}]; accountName: [${accountName}]`
    //     )
    //     continue
    //   }
    //   const [autoRestart, state] = await Promise.all([
    //     this.steamAccountsDAO.getAutoRestartInfo(accountName),
    //     this.steamAccountClientStateCacheRepository.get(accountName),
    //   ])
    //   const sac = this.allUsersClientsStorage.addSteamAccountFrom0({
    //     accountName,
    //     userId,
    //     username,
    //     planId,
    //     autoRestart,
    //   })
    //   const userCluster = this.usersClusterStorage.getOrAdd(username, plan)
    //   const [error] = userCluster.addSAC(sac)

    //   if (state) sac.setStatus(state.status)

    //   if (state && state.isFarming) {
    //     userCluster.farmWithAccount({
    //       accountName: state.accountName,
    //       gamesId: state.gamesPlaying,
    //       planId: state.planId,
    //       sessionType: "CONTINUE-FROM-PREVIOUS",
    //     })
    //   }
    //   this.logger.log(`Restoring session for account [${accountName}].`)
    //   sac.loginWithToken(refreshToken)
    // }
  }
}

type APayload = RestoreAccountSessionsUseCaseHandle.Payload
type AResponse = Promise<RestoreAccountSessionsUseCaseHandle.Response>
