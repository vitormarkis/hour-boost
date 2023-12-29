import { ApplicationError, PlanRepository, SteamAccountClientStateCacheRepository } from "core"
import { SteamAccountClient } from "~/application/services/steam"
import { FarmGamesUseCase } from "~/application/use-cases/FarmGamesUseCase"
import { FarmGamesController } from "~/presentation/controllers"
import { Logger } from "~/utils/Logger"

type AccountName = string

export class UserClientsStorage {
  steamAccountClients: Map<AccountName, SteamAccountClient> = new Map()
  readonly logger: Logger

  constructor(
    private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly farmGamesUseCase: FarmGamesUseCase,
    private readonly planRepository: PlanRepository
  ) {
    this.logger = new Logger(`User SAC Storage`)
  }

  addAccountClient(sac: SteamAccountClient) {
    this.logger.log("Appending refreshtoken cache listener on refreshToken event.")
    // mais correto seria deixar esse handler como fixo no evento de refreshToken
    // em vez de depender de ser o ultimo handler
    sac.setLastHandler("refreshToken", async refreshToken => {
      await this.sacStateCacheRepository.setRefreshToken(sac.accountName, {
        refreshToken,
        userId: sac.userId,
        username: sac.username,
        planId: sac.planId,
      })
      sac.logger.log("refreshtoken set in cache.")
    })

    this.logger.log("Appending init cache listener on LoggedOn event.")
    sac.emitter.on("hasSession", async () => {
      await this.sacStateCacheRepository.init({
        accountName: sac.accountName,
        planId: sac.planId,
        username: sac.username,
      })
      this.logger.log(`Finish initing ${sac.accountName}`)
      this.logger.log("Starting to fetch SAC State Cache.")
      const sacStateCache = await this.sacStateCacheRepository.get(sac.accountName)
      this.logger.log(`Found SAC State Cache for [${sac.accountName}]`, sacStateCache)
      if (sacStateCache) {
        this.logger.log(`-> sac.emitter: ${sac.accountName} relog with state! [...]`, sacStateCache)
        sac.emitter.emit("relog-with-state", sacStateCache)
      } else {
        this.logger.log(`-> sac.emitter: ${sac.accountName} relog without any state.`, sacStateCache)
        sac.emitter.emit("relog")
      }
    })

    sac.emitter.on("relog-with-state", async state => {
      const { accountName, username, gamesPlaying, isFarming, planId } = state
      this.logger.log(`${accountName} relogou com state.`)
      if (isFarming) {
        this.logger.log(`${accountName} relogou farmando os jogos ${gamesPlaying}`)
        const plan = await this.planRepository.getById(planId)
        if (!plan) {
          this.logger.log("Plan not found! Contact the developer.", { planId, accountName })
          return
        }
        await this.farmGamesUseCase.execute({
          accountName,
          gamesId: gamesPlaying,
          plan,
          planId,
          sac,
          username,
        })
      }
    })

    sac.emitter.on("relog", () => {
      this.logger.log(`Usuário relogou sem state.`)
    })

    this.steamAccountClients.set(sac.accountName, sac)
  }

  removeAccountClient(accountName: string) {
    this.steamAccountClients.delete(accountName)
  }

  getAccountClientOrThrow(accountName: string) {
    const steamAccountClient = this.steamAccountClients.get(accountName)
    if (!steamAccountClient)
      throw new ApplicationError("Essa Steam Account nunca foi logada no nosso servidor.")
    return steamAccountClient
  }

  getAccountClient(accountName: string) {
    return this.steamAccountClients.get(accountName) ?? null
  }

  hasAccountName(accountName: string) {
    return this.steamAccountClients.has(accountName)
  }

  getAccountsStatus() {
    const accountStatus = {} as Record<string, { farming: boolean }>
    this.steamAccountClients.forEach((client, accountName) => {
      accountStatus[accountName] = {
        farming: client.isFarming(),
      }
    })
    return accountStatus
  }
}
