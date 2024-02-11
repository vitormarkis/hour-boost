import {
  ApplicationError,
  DataOrError,
  DataOrFail,
  Fail,
  PlanInfinity,
  PlanRepository,
  PlanUsage,
  SACStateCache,
  SteamAccountClientStateCacheRepository,
  SteamAccountsRepository,
} from "core"
import SteamUser from "steam-user"
import { ErrorOccuredOnSteamClientCommand } from "~/application/commands"
import { FarmServiceBuilder } from "~/application/factories"
import {
  EventEmitter,
  FarmInfinityService,
  FarmService,
  FarmUsageService,
  PauseFarmOnAccountUsage,
  SACList,
} from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { EAppResults, SACGenericError } from "~/application/use-cases"
import { CLIENT_ERRORS_THAT_SHOULD_SCHEDULE_AUTO_RESTARTER } from "~/consts"
import { Publisher } from "~/infra/queue"
import { Logger } from "~/utils/Logger"
import { StateCachePayloadFarmService } from "~/utils/builders/SACStateCacheBuilder"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"
import { Prettify, bad, nice } from "~/utils/helpers"

export interface IUserSACsFarmingCluster {
  addSAC(...args: any[]): DataOrError<{ userCluster: UserSACsFarmingCluster }>
  farmWithAccount(details: NSUserCluster.FarmWithAccount): Promise<DataOrFail<Fail>>
  farmService: FarmService
}

export class UserSACsFarmingCluster implements IUserSACsFarmingCluster {
  private readonly publisher: Publisher
  farmService: FarmUsageService | FarmInfinityService 
  private readonly sacList: SACList = new SACList()
  private readonly username: string
  private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository
  private readonly planRepository: PlanRepository
  private readonly farmServiceFactory: FarmServiceBuilder
  private readonly planId: string
  private readonly logger: Logger
  private shouldPersistSession = true
  readonly emitter: EventEmitter<UserClusterEvents>
  readonly steamAccountsRepository: SteamAccountsRepository

  constructor(props: UserSACsFarmingClusterProps) {
    this.farmService = props.farmService
    this.username = props.username
    this.sacStateCacheRepository = props.sacStateCacheRepository
    this.planRepository = props.planRepository
    this.farmServiceFactory = props.farmServiceFactory
    this.planId = props.planId
    this.emitter = props.emitter
    this.publisher = props.publisher
    this.steamAccountsRepository = props.steamAccountsRepository
    this.logger = new Logger(`Cluster ~ ${this.username}`)
  }

  getStateCache(sac: SteamAccountClient) {
    const sacStateCacheDTO = sac.getInnerState()
    const sacStateCache = new SACStateCache(
      sacStateCacheDTO.gamesPlaying,
      sacStateCacheDTO.gamesStaging,
      sacStateCacheDTO.accountName,
      sacStateCacheDTO.planId,
      sacStateCacheDTO.username,
      this.farmService.startedAt,
      sacStateCacheDTO.status
    )
    return sacStateCache
  }

  getStateCacheDTO(sac: SteamAccountClient) {
    return this.getStateCache(sac).toJSON()
  }

  addSAC(sac: SteamAccountClient) {
    if (this.sacList.has(sac.accountName))
      return bad(
        new ApplicationError(
          "[SAC Cluster]: Attempt to add sac that already exists.",
          403,
          undefined,
          "TRIED_TO_ADD::ALREADY_EXISTS"
        )
      )
    this.sacList.set(sac.accountName, sac)

    this.logger.log(`Appending interrupt async listener on ${sac.accountName}'s sac!`)

    sac.emitter.on("user-logged-off", () => {
      this.logger.log(`${sac.accountName} logged off.`)
      this.shouldPersistSession = false
    })

    this.emitter.on("service:max-usage-exceeded", () => {
      this.shouldPersistSession = false
    })

    sac.emitter.on("hasSession", async () => {
      this.shouldPersistSession = true
    })

    sac.emitter.on("interrupt", async (sacStateCacheDTO, error) => {
      if (!sac.autoRestart && CLIENT_ERRORS_THAT_SHOULD_SCHEDULE_AUTO_RESTARTER.includes(error.eresult)) {
        this.shouldPersistSession = false
      }
      if (this.shouldPersistSession) {
        const sacStateCache = this.getStateCacheDTO(sac)
        await this.sacStateCacheRepository.set(sac.accountName, sacStateCache)
        this.logger.log(`${sacStateCache.accountName} has set the cache successfully.`)
      }

      this.pauseFarmOnAccount({
        accountName: sac.accountName,
        killSession: !this.shouldPersistSession,
      })

      const plan = await this.planRepository.getById(this.planId)
      if (plan instanceof PlanInfinity) {
        const steamAccount = await this.steamAccountsRepository.getByAccountName(sacStateCacheDTO.accountName)
        if (!steamAccount || !steamAccount.autoRelogin) return
        this.publisher.publish(
          new ErrorOccuredOnSteamClientCommand({
            when: new Date(),
            accountName: sac.accountName,
            errorEResult: error.eresult,
          })
        )
      }
    })

    sac.emitter.on("access-denied", async ({ accountName }) => {
      await this.sacStateCacheRepository.deleteAllEntriesFromAccount(accountName)
    })

    return nice({
      userCluster: this as UserSACsFarmingCluster,
    })
  }

  getInnerState(): Prettify<StateCachePayloadFarmService> {
    return {
      farmStartedAt: this.farmService.startedAt,
    }
  }

  getAccountsStatus() {
    return this.farmService.getAccountsStatus()
  }

  stopFarmAllAccounts(props: { killSession: boolean }) {
    this.sacList.stopFarmAllAccounts()
    this.farmService.stopFarmAllAccounts(props)
  }

  updateState({ gamesPlaying, accountName }: SACStateCache) {
    // const sac = this.sacList.get(accountName)
  }

  isFarming() {
    let isFarmingSACs = this.sacList.hasAccountsFarming()
    const isFarmingService = this.farmService.hasAccountsFarming()
    if (!isFarmingService && isFarmingSACs)
      throw new ApplicationError("Erro. SAC farmando, porém sem Farm Service!")
    if (isFarmingSACs !== isFarmingService)
      throw new ApplicationError("Mismatch entre isFarmingSACs e isFarmingService")
    return isFarmingSACs
  }

  hasSteamAccountClient(accountName: string) {
    return !!this.sacList.has(accountName)
  }

  async farmWithAccount({ accountName, gamesId, planId, sessionType }: NSUserCluster.FarmWithAccount) {
    try {
      const sac = this.sacList.get(accountName)
      if (!sac) return bad(new Fail({ httpStatus: 404, code: EAppResults["SAC-NOT-FOUND"] }))

      if (!this.farmService.hasAccountsFarming()) {
        this.logger.log("SETANDO PRIMEIRO FARM")
        const plan = await this.planRepository.getById(planId)
        if (!plan) {
          return bad(new Fail({ code: EAppResults["PLAN-NOT-FOUND"], httpStatus: 404 }))
        }
        this.updateFarmService(plan)
      }
      const accountIsNotFarming = !this.isAccountFarming(accountName)
      if (accountIsNotFarming && sessionType === "NEW") {
        await this.notifyFirstTimeFarming(accountName)
      }
      await this.sacStateCacheRepository.setPlayingGames(sac.accountName, gamesId, planId, sac.username)
      const [errorFarming, result] = await this.farmWithAccountImpl(sac, accountName, gamesId)
      if (errorFarming) return bad(errorFarming)
      return nice(result)
    } catch (error) {
      return bad(
        new Fail({
          code: EAppResults["UNKNOWN-ERROR"],
          payload: error instanceof Error ? error : undefined,
        })
      )
    }
  }

  private async notifyFirstTimeFarming(accountName: string) {
    const when = new Date()
    await this.sacStateCacheRepository.startFarm({
      accountName,
      when,
      initSession: true,
    })
  }

  private updateFarmService(plan: PlanInfinity | PlanUsage) {
    const now = new Date()
    const newFarmService = this.farmServiceFactory.create(this.username, plan, now)
    this.setFarmService(newFarmService)
  }

  private async farmWithAccountImpl(sac: SteamAccountClient, accountName: string, gamesId: number[]) {
    this.logger.log(`Appending account to farm on service: `, accountName)
    if (!this.isAccountFarming(accountName)) {
      const [cantFarm] = this.farmService.checkIfCanFarm()
      if (cantFarm) return bad(cantFarm)
    }

    sac.farmGames(gamesId)
    // const errorTryingToFarm = false
    const errorTryingToFarm = await Promise.race([
      new Promise<SACGenericError>(res => sac.client.once("error", res)),
      new Promise<false>(res => setTimeout(() => res(false), process.env.NODE_ENV === "TEST" ? 0 : 400).unref()),
    ])

    if (errorTryingToFarm) {
      const fail = new Fail({
        code: `cluster.farmWithAccount()::${EAppResults["UNKNOWN-CLIENT-ERROR"]}`,
        httpStatus: 400,
        payload: errorTryingToFarm,
      })
      return bad(fail)
    }

    const [error] = this.farmService.farmWithAccount(accountName)
    if (error) return bad(error)
    return nice(null)
  }

  private pauseFarmOnAccountImpl({
    accountName,
    killSession = true,
  }: NSUserCluster.PauseFarmOnAccountProps): DataOrError<null> {
    if (this.sacList.list.size === 0)
      return [new ApplicationError("Usuário não possui contas farmando.", 402)]
    const sac = this.sacList.get(accountName)
    if (!sac)
      return [new ApplicationError(`NSTH: Usuário tentou pausar farm em uma conta que não estava farmando.`)]
    // this.farmService.pauseFarmOnAccount(accountName)
    if (killSession) this.sacStateCacheRepository.stopFarm(accountName)
    sac.stopFarm()
    return [null, null]
  }

  pauseFarmOnAccount(props: NSUserCluster.PauseFarmOnAccountProps): DataOrError<null> {
    const [errorPausingFarm] = this.pauseFarmOnAccountImpl(props)
    if (errorPausingFarm) return [errorPausingFarm]
    const errorOrUsages = this.farmService.pauseFarmOnAccount(props.accountName, props.killSession ?? false)
    return errorOrUsages
  }

  pauseFarmOnAccountSync(props: NSUserCluster.PauseFarmOnAccountProps): DataOrError<PauseFarmOnAccountUsage> {
    const [errorPausingFarm] = this.pauseFarmOnAccountImpl(props)
    if (errorPausingFarm) return [errorPausingFarm]
    const errorOrUsages = this.farmService.pauseFarmOnAccountSync(
      props.accountName,
      props.killSession ?? false
    )
    return errorOrUsages
  }

  setFarmService(newFarmService: FarmUsageService | FarmInfinityService) {
    this.farmService = newFarmService
  }

  isAccountFarming(accountName: string): boolean {
    return this.farmService.isAccountFarming(accountName)
  }

  removeSAC(accountName: string) {
    this.sacList.delete(accountName)
  }
}

export type UserSACsFarmingClusterProps = {
  farmService: FarmUsageService | FarmInfinityService
  username: string
  sacStateCacheRepository: SteamAccountClientStateCacheRepository
  planRepository: PlanRepository
  farmServiceFactory: FarmServiceBuilder
  planId: string
  publisher: Publisher
  emitter: EventEmitter<UserClusterEvents>
  usageBuilder: UsageBuilder
  steamAccountsRepository: SteamAccountsRepository
}

export type UserClusterEvents = {
  "service:max-usage-exceeded": []
}

export namespace NSUserCluster {
  export type PauseFarmOnAccountProps = {
    accountName: string
    killSession?: boolean
  }

  export type SessionType = "NEW" | "CONTINUE-FROM-PREVIOUS"

  export type FarmWithAccount = {
    accountName: string
    gamesId: number[]
    planId: string
    sessionType: SessionType
  }
}
