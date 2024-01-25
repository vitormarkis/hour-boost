import { PrismaClient } from "@prisma/client"
import { SteamAccount, SteamAccountCredentials, SteamAccountsRepository } from "core"

export class SteamAccountsRepositoryDatabase implements SteamAccountsRepository {
  constructor(private readonly prisma: PrismaClient) {}
  save(steamAccount: SteamAccount): Promise<void> {
    throw new Error("Method not implemented.")
  }

  async getByAccountName(accountName: string): Promise<SteamAccount | null> {
    const dbSteamAccount = await this.prisma.steamAccount.findUnique({
      where: { accountName },
    })

    if (!dbSteamAccount) return null

    return SteamAccount.restore({
      credentials: SteamAccountCredentials.restore({
        accountName: dbSteamAccount.accountName,
        password: dbSteamAccount.password,
      }),
      id_steamAccount: dbSteamAccount.id_steamAccount,
      ownerId: dbSteamAccount.owner_id,
      autoRelogin: dbSteamAccount.autoRelogin,
    })
  }
}
