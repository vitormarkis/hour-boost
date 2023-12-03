import clerkClient from "@clerk/clerk-sdk-node"
import { IDGeneratorUUID } from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage, FarmingUsersStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { UsersDAODatabase } from "~/infra/dao"
import { prisma } from "~/infra/libs"
import { Publisher } from "~/infra/queue"
import { PlanRepositoryDatabase, UsersRepositoryDatabase } from "~/infra/repository"
import { SteamAccountsRepositoryDatabase } from "~/infra/repository/SteamAccountsRepositoryDatabase"
import { ClerkAuthentication } from "~/infra/services"

const httpProxy = "vitormarkis2369_gmail_com:998Vmarkis@la.residential.rayobyte.com:8000"
// const socksProxy = "191.242.126.249:4145"
console.log({
	httpProxy,
	// socksProxy,
})

export const steamBuilder: SteamBuilder = {
	create: () =>
		// new SteamUser({
		// 	httpProxy,
		// }),
		new SteamUser(),
}

export const farmingUsersStorage = new FarmingUsersStorage()
export const usersDAO = new UsersDAODatabase(prisma)
export const userAuthentication = new ClerkAuthentication(clerkClient)
export const planRepository = new PlanRepositoryDatabase(prisma)
export const publisher = new Publisher()
export const allUsersSteamClientsStorage = new AllUsersClientsStorage(publisher, steamBuilder)
export const usersRepository = new UsersRepositoryDatabase(prisma)
export const steamAccountsRepository = new SteamAccountsRepositoryDatabase(prisma)
export const idGenerator = new IDGeneratorUUID()
