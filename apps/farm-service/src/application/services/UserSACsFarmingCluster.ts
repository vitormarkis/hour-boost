import { ApplicationError, PlanRepository, SACStateCache, SteamAccountClientStateCacheRepository } from "core"
import { FarmServiceBuilder } from "~/application/factories"
import { EventEmitter, FarmService, SACList } from "~/application/services"
import { SACStateCacheFactory, SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { Logger } from "~/utils/Logger"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"

export class UserSACsFarmingCluster {
  private readonly publisher: Publisher
  private farmService: FarmService
  private readonly sacList: SACList = new SACList()
  private readonly username: string
  private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository
  private readonly planRepository: PlanRepository
  private readonly farmServiceFactory: FarmServiceBuilder
  private readonly planId: string
  private readonly usageBuilder: UsageBuilder
  private readonly logger: Logger
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

    // sac.emitter.on("gotRefreshToken", async ({ refreshToken, userId, username, accountName }) => {
    //   sac.logger.log("1/2 - app got refresh token.")
    //   await this.sacStateCacheRepository.setRefreshToken(accountName, {
    //     refreshToken,
    //     userId,
    //     username,
    //   })
    //   sac.logger.log("2/2 - refreshtoken set in cache.")
    // })

    sac.emitter.on("interrupt", async sacStateCache => {
      this.logger.log(
        `${sacStateCache.accountName} was interrupt, setting the cache and pausing the farm on SAC.`
      )
      await this.sacStateCacheRepository.set(sac.accountName, SACStateCacheFactory.createDTO(sac))
      this.logger.log(`${sacStateCache.accountName} has set the cache successfully.`)
      this.pauseFarmOnAccount(sacStateCache.accountName)
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

  async farmWithAccount(accountName: string, gamesId: number[], planId: string) {
    const sac = this.sacList.get(accountName)
    if (!sac)
      throw new ApplicationError(
        `[SAC Cluster.startFarm()]: Tried to start farm, but no SAC was found with name: ${accountName}. This account never logged on the application, or don't belong to the user ${this.username}.`
      )

    if (!this.farmService.hasAccountsFarming()) {
      const plan = await this.planRepository.getById(planId)
      if (!plan) {
        throw new ApplicationError(`NSTH: ID do plano não existe, contate o desenvolvedor. ${planId}`)
      }
      const newFarmService = this.farmServiceFactory.create(this.username, plan)
      this.setFarmService(newFarmService)
    }
    await this.sacStateCacheRepository.setPlayingGames(sac.accountName, gamesId, planId, sac.username)
    this.farmWithAccountImpl(sac, accountName, gamesId)
  }

  private farmWithAccountImpl(sac: SteamAccountClient, accountName: string, gamesId: number[]) {
    this.logger.log(`Appending account to farm on service: `, accountName)
    this.farmService.farmWithAccount(accountName)
    sac.farmGames(gamesId)
  }

  pauseFarmOnAccount(accountName: string) {
    const sac = this.sacList.get(accountName)
    if (!sac)
      throw new ApplicationError(
        `[SAC Cluster.stopFarm()]: Tried to stop farm, but no SAC was found with name: ${accountName}`
      )
    sac.stopFarm()
    this.farmService.pauseFarmOnAccount(accountName)
  }

  setFarmService(newFarmService: FarmService) {
    this.farmService = newFarmService
  }

  isAccountFarming(accountName: string) {
    const accountDetails = this.farmService.getAccountDetails(accountName)
    return accountDetails?.status === "FARMING"
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
