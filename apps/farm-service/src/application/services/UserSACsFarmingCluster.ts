import { ApplicationError, PlanInfinity, PlanUsage, SACStateCache, SteamAccountClientStateCacheRepository } from "core";
import { FarmService } from "~/application/services";
import { SteamAccountClient } from "~/application/services/steam";

export class UserSACsFarmingCluster {
  farmService: FarmService
  private readonly sacList: Map<string, SteamAccountClient> = new Map()
  readonly keyUserAccountName: string
  private readonly username: string
  private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository

  constructor(props: UserSACsFarmingClusterProps) {
    this.keyUserAccountName = `${props.username}:${props.accountName}`
    this.farmService = props.farmService
    this.username = props.username
    this.sacStateCacheRepository = props.sacStateCacheRepository
  }

  addSAC(sac: SteamAccountClient) {
    if (this.sacList.has(sac.accountName)) return console.log("[SAC Cluster]: Attempt to add sac that already exists.")
    this.sacList.set(sac.accountName, sac)

    sac.emitter.on("interrupt", sacStateCache => {
      this.sacStateCacheRepository.set(this.keyUserAccountName, sacStateCache)
      this.stopFarm(sacStateCache.accountName)
    })

    sac.emitter.on("hasSession", async () => {
      const sacStateCache = await this.sacStateCacheRepository.get(this.keyUserAccountName)
      if (sacStateCache) sac.emitter.emit("relog-with-state", sacStateCache)
      else sac.emitter.emit("relog")
      // sac.farmGames(gamesPlaying)
      // const farmUsageService = new FarmUsageService(this.publisher, user.plan as PlanUsage, user.username)
      // farmUsageService.farmWithAccount(accountName)
      // this.farmingUsersStorage.add(farmUsageService).startFarm()
    })

    sac.emitter.on("relog-with-state", sacStateCache => {
      console.log(`[SAC-EMITTER]: Usuário relogou com state. `, sacStateCache)
      const { accountName, gamesPlaying } = sacStateCache
      const sac = this.sacList.get(accountName)
      if (!sac) return console.log(`[SAC Cluster]: Tried to update state, but no SAC was found with name: ${accountName}`)
      sac.farmGames(gamesPlaying)
      this.farmService.hasAccountsFarming()
      // this.farmService.farmWithAccount(sac.accountName)
    })

    sac.emitter.on("relog", () => {
      console.log(`[SAC-EMITTER]: Usuário relogou sem state.`)
    })
  }

  updateState({ gamesPlaying, accountName }: SACStateCache) {
    // const sac = this.sacList.get(accountName)
  }


  isFarming() {
    let isFarmingSACs = false
    for (const [_, sac] of this.sacList) {
      if (sac.gamesPlaying.length > 0) {
        isFarmingSACs = true
        break;
      }
    }

    const isFarmingService = this.farmService.hasAccountsFarming()
    if (!isFarmingService && isFarmingSACs) throw new ApplicationError("Erro. SAC farmando, porém sem Farm Service!")
    if (isFarmingSACs !== isFarmingService) throw new ApplicationError("Mismatch entre isFarmingSACs e isFarmingService")
    return isFarmingSACs
  }

  farmWithAccount(accountName: string, gamesID: number[], plan: PlanUsage | PlanInfinity) {
    // esse método precisa cobrir esses 3 cenarios

    // possui service farmando
    // possui service sem ninguem farmando
    // nao possui service, precisa criar
    // se não tiver SAC, nem deveria tentar rodar farm

    const sac = this.sacList.get(accountName)
    if (!sac) throw new ApplicationError(`[SAC Cluster.startFarm()]: Tried to start farm, but no SAC was found with name: ${accountName}. This account never logged on the application, or don't belong to the user ${this.username}.`)
    this.farmService.farmWithAccount(accountName)
    sac.farmGames(gamesID)
  }

  stopFarm(accountName: string) {
    const sac = this.sacList.get(accountName)
    if (!sac) throw new ApplicationError(`[SAC Cluster.stopFarm()]: Tried to stop farm, but no SAC was found with name: ${accountName}`)
    this.farmService.pauseFarmOnAccount(accountName)
    sac.stopFarm()
  }

  setFarmService(newFarmService: FarmService) {
    this.farmService = newFarmService
  }
}


export type UserSACsFarmingClusterProps = {
  farmService: FarmService,
  username: string,
  accountName: string,
  sacStateCacheRepository: SteamAccountClientStateCacheRepository
}