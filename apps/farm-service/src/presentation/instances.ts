import clerkClient from "@clerk/clerk-sdk-node"
import { FarmingUsersStorage, SteamFarming } from "~/application/services"
import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import { PlanRepositoryDatabase, UsersRepositoryDatabase } from "~/infra/repository"
import { ClerkAuthentication } from "~/infra/services"

export const farmingUsersStorage = new FarmingUsersStorage()
export const usersDAO = new UsersDAODatabase(prisma)
export const userAuthentication = new ClerkAuthentication(clerkClient)
export const planRepository = new PlanRepositoryDatabase(prisma)
export const publisher = new Publisher()
export const steamFarming = new SteamFarming(publisher)
export const usersRepository = new UsersRepositoryDatabase(prisma)
