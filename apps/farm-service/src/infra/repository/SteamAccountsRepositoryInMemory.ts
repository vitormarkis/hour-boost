import { PrismaClient } from "@prisma/client"
import { SteamAccount, SteamAccountCredentials, SteamAccountsRepository } from "core"
import { UsersInMemory } from "~/infra/repository/UsersInMemory"

export class SteamAccountsRepositoryInMemory implements SteamAccountsRepository {
	constructor(private readonly usersMemory: UsersInMemory) {}

	async getByAccountName(accountName: string): Promise<SteamAccount | null> {
		const owner = this.usersMemory.users.find(user =>
			user.steamAccounts.data.some(sa => sa.credentials.accountName === accountName)
		)
		return owner?.steamAccounts.getByAccountName(accountName) ?? null
	}
}
