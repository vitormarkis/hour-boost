import clerkClient from "@clerk/clerk-sdk-node"
import { IDGeneratorUUID } from "core"
import SteamUser from "steam-user"
import { FarmServiceBuilder } from "~/application/factories"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import {
  StartFarmPlanHandler,
  LogSteamStopFarmHandler,
  LogSteamStartFarmHandler,
  PersistFarmSessionUsageHandler,
} from "~/domain/handler"
import { PersistFarmSessionInfinityHandler } from "~/domain/handler/PersistFarmSessionInfinityHandler"
import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { redis } from "~/infra/libs/redis"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryDatabase,
  SteamAccountsRepositoryDatabase,
  UsersRepositoryDatabase,
} from "~/infra/repository"
import { SteamAccountClientStateCacheRedis } from "~/infra/repository/SteamAccountClientStateCacheRedis"
import { ClerkAuthentication } from "~/infra/services"
import { EventEmitterBuilder, SteamAccountClientBuilder } from "~/utils/builders"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"
import { UserClusterBuilder } from "~/utils/builders/UserClusterBuilder"

const httpProxy = process.env.PROXY_URL

if (httpProxy) {
  console.log(`Usando proxy ${httpProxy.slice(0, 18) + "*******"}`)
}

export const steamBuilder: SteamBuilder = {
  create: () => new SteamUser(httpProxy ? { httpProxy, enablePicsCache: true } : { enablePicsCache: true }),
}

const usageBuilder = new UsageBuilder()

export const publisher = new Publisher()
// export const farmingUsersStorage = new FarmingUsersStorage()
export const emitterBuilder = new EventEmitterBuilder()
export const steamUserBuilder = steamBuilder
export const planRepository = new PlanRepositoryDatabase(prisma)
export const sacBuilder = new SteamAccountClientBuilder(emitterBuilder, publisher, steamUserBuilder)
export const allUsersClientsStorage = new AllUsersClientsStorage(sacBuilder)
export const sacStateCacheRepository = new SteamAccountClientStateCacheRedis(redis)
export const farmServiceBuilder = new FarmServiceBuilder({
  publisher,
  emitterBuilder,
})
export const userClusterBuilder = new UserClusterBuilder(
  farmServiceBuilder,
  sacStateCacheRepository,
  planRepository,
  emitterBuilder,
  publisher,
  usageBuilder
)
export const usersClusterStorage = new UsersSACsFarmingClusterStorage(userClusterBuilder)
export const usersDAO = new UsersDAODatabase(prisma)
export const userAuthentication = new ClerkAuthentication(clerkClient)
export const usersRepository = new UsersRepositoryDatabase(prisma)
export const steamAccountsRepository = new SteamAccountsRepositoryDatabase(prisma)
export const idGenerator = new IDGeneratorUUID()

publisher.register(new PersistFarmSessionUsageHandler(planRepository, usageBuilder))
publisher.register(new PersistFarmSessionInfinityHandler(planRepository, usageBuilder))
publisher.register(new StartFarmPlanHandler())

// publisher.register(new LogUserFarmedHandler())

publisher.register(new LogSteamStopFarmHandler())
publisher.register(new LogSteamStartFarmHandler())
// publisher.register(new LogUserCompleteFarmSessionHandler())
