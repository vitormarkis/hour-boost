import clerkClient from "@clerk/clerk-sdk-node"
import { IDGeneratorUUID } from "core"
import SteamUser from "steam-user"
import { FarmServiceBuilder } from "~/application/factories"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import {
  CheckSteamAccountOwnerStatusUseCase,
  GetPersonaStateUseCase,
  GetUserSteamGamesUseCase,
  RefreshPersonaStateUseCase,
  RestoreAccountSessionUseCase,
  FarmGamesUseCase,
  ScheduleAutoReloginUseCase,
} from "~/application/use-cases"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { AutoReloginScheduler } from "~/domain/cron"
import {
  LogSteamStartFarmHandler,
  LogSteamStopFarmHandler,
  StartFarmPlanHandler,
  PersistFarmSessionHandler,
  ScheduleAutoReloginHandler,
} from "~/domain/handler"
import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { redis } from "~/infra/libs/redis"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryDatabase,
  SteamAccountsRepositoryDatabase,
  UsersRepositoryDatabase,
  SteamAccountClientStateCacheRedis,
} from "~/infra/repository"
import { ClerkAuthentication } from "~/infra/services"
import { RefreshGamesUseCase } from "~/presentation/presenters"
import { EventEmitterBuilder, SteamAccountClientBuilder } from "~/utils/builders"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"
import { UserClusterBuilder } from "~/utils/builders"

const httpProxy = process.env.PROXY_URL

if (httpProxy) {
  console.log(`Usando proxy ${httpProxy.slice(0, 18) + "*******"}`)
}

let options: ConstructorParameters<typeof SteamUser>[0] = {
  enablePicsCache: true,
  autoRelogin: false,
}
if (httpProxy) options.httpProxy = httpProxy

console.log({ options })
export const steamBuilder: SteamBuilder = {
  create: () => new SteamUser(options),
}

export const steamUserBuilder = steamBuilder
const usageBuilder = new UsageBuilder()
export const publisher = new Publisher()
export const emitterBuilder = new EventEmitterBuilder()
export const autoReloginScheduler = new AutoReloginScheduler()
export const planRepository = new PlanRepositoryDatabase(prisma)
export const steamAccountsRepository = new SteamAccountsRepositoryDatabase(prisma)
export const steamAccountClientStateCacheRepository = new SteamAccountClientStateCacheRedis(redis)
export const userAuthentication = new ClerkAuthentication(clerkClient)
export const usersRepository = new UsersRepositoryDatabase(prisma)
export const idGenerator = new IDGeneratorUUID()

export const sacBuilder = new SteamAccountClientBuilder(emitterBuilder, publisher, steamUserBuilder)

export const farmServiceBuilder = new FarmServiceBuilder({
  publisher,
  emitterBuilder,
})
export const userClusterBuilder = new UserClusterBuilder(
  farmServiceBuilder,
  steamAccountClientStateCacheRepository,
  planRepository,
  emitterBuilder,
  publisher,
  usageBuilder,
  steamAccountsRepository
)
export const usersClusterStorage = new UsersSACsFarmingClusterStorage(userClusterBuilder)
export const farmGamesUseCase = new FarmGamesUseCase(usersClusterStorage)
export const allUsersClientsStorage = new AllUsersClientsStorage(
  sacBuilder,
  steamAccountClientStateCacheRepository,
  farmGamesUseCase,
  planRepository
)

// export const farmingUsersStorage = new FarmingUsersStorage()

export const checkSteamAccountOwnerStatusUseCase = new CheckSteamAccountOwnerStatusUseCase(
  steamAccountsRepository
)

export const refreshPersonaState = new RefreshPersonaStateUseCase(
  steamAccountClientStateCacheRepository,
  allUsersClientsStorage
)

export const getPersonaStateUseCase = new GetPersonaStateUseCase(
  steamAccountClientStateCacheRepository,
  refreshPersonaState
)

export const refreshGamesUseCase = new RefreshGamesUseCase(
  steamAccountClientStateCacheRepository,
  allUsersClientsStorage
)
export const getUserSteamGamesUseCase = new GetUserSteamGamesUseCase(
  steamAccountClientStateCacheRepository,
  refreshGamesUseCase
)

export const usersDAO = new UsersDAODatabase(
  prisma,
  getPersonaStateUseCase,
  getUserSteamGamesUseCase,
  steamAccountClientStateCacheRepository
)
export const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(
  steamAccountsRepository,
  allUsersClientsStorage,
  usersDAO,
  usersClusterStorage,
  steamAccountClientStateCacheRepository
)

export const scheduleAutoReloginUseCase = new ScheduleAutoReloginUseCase(
  autoReloginScheduler,
  restoreAccountSessionUseCase
)

publisher.register(new StartFarmPlanHandler())
publisher.register(new PersistFarmSessionHandler(planRepository, steamAccountClientStateCacheRepository))

// publisher.register(new LogUserFarmedHandler())

publisher.register(new LogSteamStopFarmHandler())
publisher.register(new LogSteamStartFarmHandler())
publisher.register(new ScheduleAutoReloginHandler(scheduleAutoReloginUseCase))
// publisher.register(new LogUserCompleteFarmSessionHandler())
