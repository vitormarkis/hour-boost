import clerkClient from "@clerk/clerk-sdk-node"
import { IDGeneratorUUID } from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryDatabase,
  SteamAccountClientStateCacheInMemory,
  UsersRepositoryDatabase,
} from "~/infra/repository"
import { SteamAccountsRepositoryDatabase } from "~/infra/repository"
import { ClerkAuthentication } from "~/infra/services"

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

export const publisher = new Publisher()

// export const farmingUsersStorage = new FarmingUsersStorage()
export const allUsersClientsStorage = new AllUsersClientsStorage(publisher, steamBuilder)
export const sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
export const usersClusterStorage = new UsersSACsFarmingClusterStorage()
export const usersDAO = new UsersDAODatabase(prisma)
export const userAuthentication = new ClerkAuthentication(clerkClient)
export const planRepository = new PlanRepositoryDatabase(prisma)
export const usersRepository = new UsersRepositoryDatabase(prisma)
export const steamAccountsRepository = new SteamAccountsRepositoryDatabase(prisma)
export const idGenerator = new IDGeneratorUUID()
