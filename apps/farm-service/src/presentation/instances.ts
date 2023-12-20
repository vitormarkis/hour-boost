import clerkClient from "@clerk/clerk-sdk-node"
import { IDGeneratorUUID } from "core"
import SteamUser from "steam-user"
import { FarmServiceBuilder } from "~/application/factories"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import {
  StartFarmPlanHandler,
  PersistFarmSessionExpiredMidFarmHandler,
  LogSteamStopFarmHandler,
  LogSteamStartFarmHandler,
  PersistFarmSessionUsageHandler,
} from "~/domain/handler"
import { LogPlanExpiredMidFarm } from "~/domain/handler/LogPlanExpiredMidFarm"
import { PersistFarmSessionInfinityHandler } from "~/domain/handler/PersistFarmSessionInfinityHandler"
import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryDatabase,
  SteamAccountClientStateCacheInMemory,
  SteamAccountsRepositoryDatabase,
  UsersRepositoryDatabase,
} from "~/infra/repository"
import { ClerkAuthentication } from "~/infra/services"
import { EventEmitterBuilder, SteamAccountClientBuilder, SteamUserMockBuilder } from "~/utils/builders"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"
import { UserClusterBuilder } from "~/utils/builders/UserClusterBuilder"

const httpProxy = process.env.PROXY_URL

if (httpProxy) {
  console.log(`Usando proxy ${httpProxy.slice(0, 18) + "*******"}`)
}

export const steamBuilder: SteamBuilder = {
  create: () => {
    try {
      return new SteamUser(httpProxy ? { httpProxy } : undefined)
    } catch (error) {
      console.log(`[PROXY ERROR CAUGHT] `, error)
      return new SteamUser()
    }
  },
}

const usageBuilder = new UsageBuilder()

export const publisher = new Publisher()
// export const farmingUsersStorage = new FarmingUsersStorage()
export const emitterBuilder = new EventEmitterBuilder()
export const steamUserBuilder = steamBuilder
export const planRepository = new PlanRepositoryDatabase(prisma)
export const sacBuilder = new SteamAccountClientBuilder(emitterBuilder, publisher, steamUserBuilder)
export const allUsersClientsStorage = new AllUsersClientsStorage(sacBuilder)
export const sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
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
publisher.register(new PersistFarmSessionExpiredMidFarmHandler(planRepository))
publisher.register(new StartFarmPlanHandler())
publisher.register(new LogPlanExpiredMidFarm())

// publisher.register(new LogUserFarmedHandler())

publisher.register(new LogSteamStopFarmHandler())
publisher.register(new LogSteamStartFarmHandler())
// publisher.register(new LogUserCompleteFarmSessionHandler())
