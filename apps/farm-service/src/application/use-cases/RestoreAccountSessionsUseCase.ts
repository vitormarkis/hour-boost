import { PlanRepository, SteamAccountClientStateCacheRepository, UseCase } from "core"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
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
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly planRepository: PlanRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersClusterStorage: UsersSACsFarmingClusterStorage
  ) {}

  async execute({ whitelistAccountNames }: APayload = {} as APayload): AResponse {
    const allLoggedUsersKeys = await this.steamAccountClientStateCacheRepository.getUsersRefreshToken()
    const loggedUsersKeys = whitelistAccountNames
      ? allLoggedUsersKeys.filter(k => {
          const [accountName] = k.split(":")
          return whitelistAccountNames.includes(accountName)
        })
      : allLoggedUsersKeys
    this.logger.log({
      allLoggedUsersKeys,
      loggedUsersKeys,
    })
    this.logger.log("got accounts keys ", loggedUsersKeys)
    const sessionsSchema = loggedUsersKeys.reduce((acc, key) => {
      const [accountName] = key.split(":")
      acc.push({
        accountName,
        key,
      })
      return acc
    }, [] as RestoreSessionSchema[])
    const sessionsPromises = sessionsSchema.map(async ({ accountName }) => {
      const foundRefreshToken = await this.steamAccountClientStateCacheRepository.getRefreshToken(accountName)
      if (!foundRefreshToken) return null

      return {
        accountName,
        ...foundRefreshToken,
      }
    })
    const sessions = await Promise.all(sessionsPromises)
    this.logger.log(
      "got refresh tokens for each account ",
      sessions.map(s => s?.accountName)
    )
    for (const session of sessions) {
      if (!session) continue
      const { accountName, refreshToken, userId, username, planId } = session
      const plan = await this.planRepository.getById(planId)
      if (!plan) {
        console.log(
          `[NSTH]: Plano não encontrado com id [${planId}]; username: [${username}]; accountName: [${accountName}]`
        )
        continue
      }
      const state = await this.steamAccountClientStateCacheRepository.get(accountName)
      const sac = this.allUsersClientsStorage.addSteamAccountFrom0({ accountName, userId, username, planId })
      const userCluster = this.usersClusterStorage.getOrAdd(username, plan).addSAC(sac)

      if (state && state.isFarming) {
        userCluster.farmWithAccount({
          accountName: state.accountName,
          gamesId: state.gamesPlaying,
          planId: state.planId,
          sessionType: "CONTINUE-FROM-PREVIOUS",
        })
      }
      this.logger.log(`Restoring session for account [${accountName}].`)
      sac.loginWithToken(refreshToken)
    }
  }
}

type APayload = RestoreAccountSessionsUseCaseHandle.Payload
type AResponse = Promise<RestoreAccountSessionsUseCaseHandle.Response>

interface RestoreSessionSchema {
  accountName: string
  key: string
}
