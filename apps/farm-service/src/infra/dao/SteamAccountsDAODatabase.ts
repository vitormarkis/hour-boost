import { PrismaClient } from "@prisma/client"
import { SteamAccountsDAO } from "core"

export class SteamAccountsDAODatabase implements SteamAccountsDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async listAccountNames(options?: {
    filter?: {
      onlyOwnedAccounts: boolean
    }
  }): Promise<string[]> {
    const { filter } = options ?? {}
    let accountNameList = await this.prisma.steamAccount.findMany({
      select: {
        accountName: true,
        owner_id: true,
      },
    })

    if (filter?.onlyOwnedAccounts) {
      accountNameList = accountNameList.filter(acc => !!acc.owner_id)
    }
    return accountNameList.map(ac => ac.accountName)
  }

  async getAutoRestartInfo(accountName: string): Promise<boolean> {
    const result = await this.prisma.steamAccount.findUnique({
      where: {
        accountName,
      },
      select: {
        autoRelogin: true,
      },
    })
    // 44: consertar isso
    return result!.autoRelogin
  }
}
