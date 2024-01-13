import {
  ApplicationError,
  DataOrError,
  PlanInfinity,
  PlanRepository,
  PlanUsage,
  SACStateCache,
  SteamAccountClientStateCacheRepository,
} from "core"
import { FarmServiceBuilder } from "~/application/factories"
import { EventEmitter, FarmService, PauseFarmOnAccountUsage, SACList } from "~/application/services"
import { SACStateCacheFactory, SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { Logger } from "~/utils/Logger"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"

export class UserSACsFarmingCluster {
  private readonly publisher: Publisher
  farmService: FarmService
  private readonly sacList: SACList = new SACList()
  private readonly username: string
  private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository
  private readonly planRepository: PlanRepository
  private readonly farmServiceFactory: FarmServiceBuilder
  private readonly planId: string
  private readonly usageBuilder: UsageBuilder
  private readonly logger: Logger
  private shouldPersistSession = true
  readonly emitter: EventEmitter<UserClusterEvents>

  constructor(props: UserSACsFarmingClusterProps) {
    this.farmService = props.farmService
    this.username = props.username
    this.sacStateCacheRepository = props.sacStateCacheRepository
    this.planRepository = props.planRepository
    this.farmServiceFactory = props.farmServiceFactory
    this.planId = props.planId
    this.emitter = props.emitter
    this.publisher = props.publisher
    this.usageBuilder = props.usageBuilder
    this.logger = new Logger(`Cluster ~ ${this.username}`)
  }

  getAccountsStatus() {
    return this.farmService.getAccountsStatus()
  }

  stopFarmAllAccounts() {
    this.sacList.stopFarmAllAccounts()
    this.farmService.stopFarmAllAccounts()
  }

  addSAC(sac: SteamAccountClient): UserSACsFarmingCluster {
    if (this.sacList.has(sac.accountName))
      throw new ApplicationError("[SAC Cluster]: Attempt to add sac that already exists.")
    this.sacList.set(sac.accountName, sac)

    this.logger.log(`Appending interrupt async listener on ${sac.accountName}'s sac!`)

    sac.emitter.on("user-logged-off", () => {
      this.logger.log(`${sac.accountName} logged off.`)
      this.shouldPersistSession = false
    })

    sac.emitter.on("interrupt", async sacStateCacheDTO => {
      if (this.shouldPersistSession) {
        const sacStateCache = SACStateCacheFactory.createDTO({
          accountName: sacStateCacheDTO.accountName,
          gamesPlaying: sacStateCacheDTO.gamesPlaying,
          isFarming: sacStateCacheDTO.isFarming,
          planId: sacStateCacheDTO.planId,
          username: sacStateCacheDTO.username,
          farmStartedAt: this.farmService.startedAt,
        })
        await this.sacStateCacheRepository.set(sac.accountName, sacStateCache)
        this.logger.log(`${sacStateCache.accountName} has set the cache successfully.`)
        this.pauseFarmOnAccount({
          accountName: sacStateCache.accountName,
          killSession: false,
        })
      }
    })

    return this
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

  async farmWithAccount({
    accountName,
    gamesId,
    planId,
    sessionType,
  }: NSUserCluster.FarmWithAccount): Promise<DataOrError<null>> {
    try {
      const sac = this.sacList.get(accountName)
      if (!sac)
        return [
          new ApplicationError(
            `[SAC Cluster.startFarm()]: Tried to start farm, but no SAC was found with name: ${accountName}. This account never logged on the application, or don't belong to the user ${this.username}.`
          ),
        ]

      if (!this.farmService.hasAccountsFarming()) {
        this.logger.log("SETANDO PRIMEIRO FARM")
        const plan = await this.planRepository.getById(planId)
        if (!plan) {
          return [new ApplicationError(`NSTH: ID do plano não existe, contate o desenvolvedor. ${planId}`)]
        }
        this.updateFarmService(plan)
      }
      const accountIsNotFarming = !this.isAccountFarming(accountName)
      if (accountIsNotFarming && sessionType === "NEW") {
        await this.notifyFirstTimeFarming(accountName)
      }
      await this.sacStateCacheRepository.setPlayingGames(sac.accountName, gamesId, planId, sac.username)
      return this.farmWithAccountImpl(sac, accountName, gamesId)
    } catch (error) {
      console.log({ "usersFarmingCluster.farmWithAccount.error": error })
      if (error instanceof Error) {
        return [new ApplicationError(error.message)]
      }
      return [new ApplicationError("Erro desconhecido")]
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

  private farmWithAccountImpl(
    sac: SteamAccountClient,
    accountName: string,
    gamesId: number[]
  ): DataOrError<null> {
    this.logger.log(`Appending account to farm on service: `, accountName)
    if (!this.isAccountFarming(accountName)) {
      const [error] = this.farmService.farmWithAccount(accountName)
      if (error) return [error]
    }
    sac.farmGames(gamesId)
    return [null, null]
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
    const errorOrUsages = this.farmService.pauseFarmOnAccount(props.accountName)
    return errorOrUsages
  }

  pauseFarmOnAccountSync(props: NSUserCluster.PauseFarmOnAccountProps): DataOrError<PauseFarmOnAccountUsage> {
    const [errorPausingFarm] = this.pauseFarmOnAccountImpl(props)
    if (errorPausingFarm) return [errorPausingFarm]
    const errorOrUsages = this.farmService.pauseFarmOnAccountSync(props.accountName)
    return errorOrUsages
  }

  setFarmService(newFarmService: FarmService) {
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
  farmService: FarmService
  username: string
  sacStateCacheRepository: SteamAccountClientStateCacheRepository
  planRepository: PlanRepository
  farmServiceFactory: FarmServiceBuilder
  planId: string
  publisher: Publisher
  emitter: EventEmitter<UserClusterEvents>
  usageBuilder: UsageBuilder
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
