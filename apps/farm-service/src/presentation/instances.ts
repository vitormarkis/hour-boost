import clerkClient from "@clerk/clerk-sdk-node"
import SteamUser from "steam-user"
import { FarmingUsersStorage, UserSteamClientsStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import { PlanRepositoryDatabase, UsersRepositoryDatabase } from "~/infra/repository"
import { ClerkAuthentication } from "~/infra/services"

const steamBuilder: SteamBuilder = {
  create: () => new SteamUser(),
}

export const farmingUsersStorage = new FarmingUsersStorage()
export const usersDAO = new UsersDAODatabase(prisma)
export const userAuthentication = new ClerkAuthentication(clerkClient)
export const planRepository = new PlanRepositoryDatabase(prisma)
export const publisher = new Publisher()
export const userSteamClientsStorage = new UserSteamClientsStorage(publisher, steamBuilder)
export const usersRepository = new UsersRepositoryDatabase(prisma)
