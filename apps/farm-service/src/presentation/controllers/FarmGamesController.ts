import {
  ApplicationError,
  SteamAccountClientStateCacheRepository,
  UsersRepository,
} from "core"
import { FarmServiceFactory } from "~/application/factories"

import {
  AllUsersClientsStorage,
  IFarmingUsersStorage,
  UserSACsFarmingCluster,
  UsersSACsFarmingClusterStorage,
} from "~/application/services"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { HttpClient } from "~/contracts"
import { Publisher } from "~/infra/queue"
import { SteamClientEventsRequired } from "~/presentation/controllers"
import { areTwoArraysEqual, makeRes } from "~/utils"

export class FarmGamesController {
  private readonly publisher: Publisher
  private readonly usersRepository: UsersRepository
  private readonly allUsersClientsStorage: AllUsersClientsStorage
  private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository
  private readonly usersClusterStorage: UsersSACsFarmingClusterStorage

  constructor(props: FarmGamesControllerProps
  ) {
    this.publisher = props.publisher
    this.usersRepository = props.usersRepository
    this.allUsersClientsStorage = props.allUsersClientsStorage
    this.sacStateCacheRepository = props.sacStateCacheRepository
    this.usersClusterStorage = props.usersClusterStorage
  }

  async handle(
    req: HttpClient.Request<{
      userId: string
      gamesID: number[]
      accountName: string
    }>
  ): Promise<HttpClient.Response> {
    const { accountName, gamesID, userId } = req.payload
    const user = await this.usersRepository.getByID(req.payload.userId)
    if (!user) throw new ApplicationError("Usuário não encontrado.", 404)
    const steamAccountDomain = user.steamAccounts.data.find(sa => sa.credentials.accountName === accountName)
    if (!steamAccountDomain)
      throw new ApplicationError("Steam Account nunca foi registrada ou ela não pertence à você.", 400)

    const { steamAccountClient: sac } = this.allUsersClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username: user.username,
    })
    if (!sac) throw new ApplicationError("Essa conta nunca se conectou à Steam.")
    if (!sac.logged) {
      sac.login(steamAccountDomain.credentials.accountName, steamAccountDomain.credentials.password)

      const steamClientEventsRequired = new SteamClientEventsRequired(sac, EVENT_PROMISES_TIMEOUT_IN_SECONDS)

      const eventsPromisesResolved = await Promise.race(
        steamClientEventsRequired.getEventPromises({
          loggedOn: true,
          steamGuard: true,
          error: true,
          timeout: true,
        })
      )

      if (eventsPromisesResolved.type === "error") {
        const [error] = eventsPromisesResolved.args
        if (error.eresult === 18)
          return makeRes(
            404,
            "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente.",
            error
          )
        return makeRes(400, "Aconteceu algum erro no client da Steam.", {
          eresult: error.eresult,
        })
      }

      if (eventsPromisesResolved.type === "steamGuard") {
        const [domain, setCode] = eventsPromisesResolved.args
        sac.setManualHandler("steamGuard", code => setCode(code))
        return makeRes(
          202,
          `Steam Guard requerido. Enviando para ${domain ? `e-mail com final ${domain}` : `seu celular.`}`
        )
      }
    }
    if (gamesID.length === 0) {
      throw new ApplicationError("Você não pode farmar 0 jogos, começe o farm a partir de 1.", 403)
    }
    if (gamesID.length > user.plan.maxGamesAllowed) {
      const hasS = user.plan.maxGamesAllowed > 1 ? "s" : ""
      throw new ApplicationError(
        `Seu plano não permite o farm de mais do que ${user.plan.maxGamesAllowed} jogo${hasS} por vez.`,
        403
      )
    }
    const noNewGameAddToFarm = areTwoArraysEqual(gamesID, sac.getGamesPlaying())
    if (noNewGameAddToFarm) return makeRes(200, "Nenhum novo game adicionado ao farm.")


    // const KEY_USER_ACCOUNTNAME = `${user.username}:${accountName}`

    // const managementSteamAccountFarmingClusterStorage = new ManagementSteamAccountFarmingClusterStorage(
    //   this.steamAccountFarmingClusterStorage,
    //   sac,
    //   this.sacStateCacheRepository
    // )
    // const userCluster = managementSteamAccountFarmingClusterStorage.getOrAddUserCluster(
    //   KEY_USER_ACCOUNTNAME,
    //   farmServiceFactory.getFarmService(user.plan)
    // )

    const farmServiceFactory = new FarmServiceFactory({
      publisher: this.publisher,
      username: user.username,
    })

    const userCluster =
      this.usersClusterStorage.get(user.username) ?? this.usersClusterStorage.add(
        user.username,
        new UserSACsFarmingCluster({
          farmService: farmServiceFactory.createNewFarmService(user.plan),
          username: user.username,
          accountName: accountName,
          sacStateCacheRepository: this.sacStateCacheRepository
        })
      )



    // possui service farmando
    // possui service sem ninguem farmando
    // nao possui service, precisa criar
    if (!userCluster.farmService.hasAccountsFarming()) {
      const farmService = farmServiceFactory.createNewFarmService(user.plan)
      userCluster.setFarmService(farmService)
    }
    if (!userCluster.hasSteamAccountClient(accountName)) {
      userCluster.addSAC(sac)
    }
    userCluster.farmWithAccount(accountName, gamesID, user.plan)

    return makeRes(200, "Iniciando farm.")


    // if (user.plan instanceof PlanInfinity) {
    //   // const farmInfinityService = new FarmInfinityService(
    //   //   this.publisher,
    //   //   user.username,
    //   //   user.plan.id_plan,
    //   //   user.plan.ownerId
    //   // )

    //   // essa instanciação pode estar dentro do cluster, com base no user.plan.type

    // }

    // if (user.plan instanceof PlanUsage) {
    //   // const { safCluster } = this.steamAccountFarmingCluster.getByAccountName(accountName)
    //   // safCluster.farmGames(gamesID)

    //   const farmUsageService = new FarmUsageService(this.publisher, user.plan, user.username)
    //   farmUsageService.farmWithAccount(accountName)
    //   this.farmingUsersStorage.add(farmUsageService).startFarm()
    //   sac.farmGames(gamesID)
    //   // sac.emitter.on("interrupt", () => {
    //   //   console.log("[sac emitter]: interrupt -> parando sac e service")
    //   //   sac.stopFarm()
    //   //   farmUsageService.stopFarm()
    //   //   // this.farmingUsersStorage.get(user.username).getAccount()
    //   //   // remover o farm que possui o set interval, pra conseguir adicinoar um novo depois
    //   // })
    //   return makeRes(200, "Iniciando farm.")
    // }

    // throw new ApplicationError("Instância do plano do usuário não suportado.")
  }
}

type FarmGamesControllerProps = {
  publisher: Publisher,
  usersRepository: UsersRepository,
  allUsersClientsStorage: AllUsersClientsStorage,
  sacStateCacheRepository: SteamAccountClientStateCacheRepository,
  usersClusterStorage: UsersSACsFarmingClusterStorage
}

