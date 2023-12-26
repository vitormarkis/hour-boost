import { ApplicationError, PlanRepository, SACStateCache, SteamAccountClientStateCacheRepository } from "core"
import { FarmServiceBuilder } from "~/application/factories"
import { EventEmitter, FarmService, SACList } from "~/application/services"
import { SACStateCacheFactory, SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
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
  }

  getAccountsStatus() {
    return this.farmService.getAccountsStatus()
  }

  private getKeyUserAccountName(accountName: string) {
    return `${this.username}:${accountName}`
  }

  stopFarmAllAccounts() {
    this.sacList.stopFarmAllAccounts()
    this.farmService.stopFarmAllAccounts()
  }

  addSAC(sac: SteamAccountClient): UserSACsFarmingCluster {
    if (this.sacList.has(sac.accountName))
      throw new ApplicationError("[SAC Cluster]: Attempt to add sac that already exists.")
    this.sacList.set(sac.accountName, sac)

    console.log(`[ACC-CLUSTER]: Appending interrupt async listener on ${sac.accountName}'s sac!`)

    sac.emitter.on("interrupt", async sacStateCache => {
      console.log(
        `[ACC-CLUSTER]: [1/2] ${sacStateCache.accountName} was interrupt, setting the cache and pausing the farm on SAC.`
      )
      await this.sacStateCacheRepository.set(
        this.getKeyUserAccountName(sac.accountName),
        SACStateCacheFactory.createDTO(sac)
      )
      console.log(`[ACC-CLUSTER]: [2/2] ${sacStateCache.accountName} has set the cache successfully.`)
      this.pauseFarmOnAccount(sacStateCache.accountName)
    })

    sac.emitter.on("hasSession", async () => {
      console.log("[ACC-CLUSTER 1/2] Starting to fetch SAC State Cache.")
      const sacStateCache = await this.sacStateCacheRepository.get(
        this.getKeyUserAccountName(sac.accountName)
      )
      console.log(`[ACC-CLUSTER 2/2] Found SAC State Cache for [${sac.accountName}]`, sacStateCache)
      if (sacStateCache) {
        console.log(`[ACC-CLUSTER -> sac.emitter]: ${sac.accountName} relog with state! [...]`, sacStateCache)
        sac.emitter.emit("relog-with-state", sacStateCache)
      } else {
        console.log(
          `[ACC-CLUSTER -> sac.emitter]: ${sac.accountName} relog without any state.`,
          sacStateCache
        )
        sac.emitter.emit("relog")
      }
    })

    sac.emitter.on("relog-with-state", async sacStateCache => {
      console.log(`[ACC-CLUSTER]: ${sacStateCache.accountName} relogou com state. `, sacStateCache)
      const { accountName, gamesPlaying, isFarming } = sacStateCache
      const sac = this.sacList.get(accountName)
      if (!sac)
        return console.log(
          `[ACC-CLUSTER]: Tried to update state, but no SAC was found with name: ${accountName}`
        )
      if (isFarming) {
        console.log(`[ACC-CLUSTER]: ${accountName} relogou farmando os jogos ${gamesPlaying}`)
        await this.farmWithAccount(accountName, gamesPlaying, this.planId)
      }
    })

    sac.emitter.on("relog", () => {
      console.log(`[ACC-CLUSTER]: Usuário relogou sem state.`)
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

  async farmWithAccount(accountName: string, gamesID: number[], planId: string) {
    console.log({ gamesID })
    const sac = this.sacList.get(accountName)
    if (!sac)
      throw new ApplicationError(
        `[SAC Cluster.startFarm()]: Tried to start farm, but no SAC was found with name: ${accountName}. This account never logged on the application, or don't belong to the user ${this.username}.`
      )

    // esse método precisa cobrir esses 3 cenarios

    // possui service sem ninguem farmando
    // possui service farmando
    // se não tiver SAC, nem deveria tentar rodar farm

    if (!this.farmService.hasAccountsFarming()) {
      const plan = await this.planRepository.getById(planId)
      if (!plan) {
        throw new ApplicationError(`NSTH: ID do plano não existe, contate o desenvolvedor. ${planId}`)
      }
      const newFarmService = this.farmServiceFactory.create(this.username, plan)
      this.setFarmService(newFarmService)
    }
    this.farmWithAccountImpl(sac, accountName, gamesID)
  }

  private farmWithAccountImpl(sac: SteamAccountClient, accountName: string, gamesID: number[]) {
    console.log(`Appending account to farm on service: `, accountName)
    this.farmService.farmWithAccount(accountName)
    sac.farmGames(gamesID)
  }

  pauseFarmOnAccount(accountName: string) {
    console.log(`pauseFarmOnAccount FOI CHAMADO!!!!!`)
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
