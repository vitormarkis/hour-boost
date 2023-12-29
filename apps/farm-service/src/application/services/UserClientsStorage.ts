import { ApplicationError, SteamAccountClientStateCacheRepository } from "core"
import { SteamAccountClient } from "~/application/services/steam"
import { Logger } from "~/utils/Logger"

type AccountName = string

export class UserClientsStorage {
  steamAccountClients: Map<AccountName, SteamAccountClient> = new Map()
  readonly logger: Logger

  constructor(private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository) {
    this.logger = new Logger(`User SAC Storage`)
  }

  addAccountClient(sac: SteamAccountClient) {
    // 998
    this.logger.log("Appending init cache listener on LoggedOn event.")
    sac.emitter.on("hasSession", async () => {
      await this.sacStateCacheRepository.init(sac.accountName)
      this.logger.log(`Finish initing ${sac.accountName}`)
    })
    this.steamAccountClients.set(sac.accountName, sac)
  }

  removeAccountClient(accountName: string) {
    this.steamAccountClients.delete(accountName)
  }

  getAccountClientOrThrow(accountName: string) {
    const steamAccountClient = this.steamAccountClients.get(accountName)
    if (!steamAccountClient)
      throw new ApplicationError("Essa Steam Account nunca foi logada no nosso servidor.")
    return steamAccountClient
  }

  getAccountClient(accountName: string) {
    return this.steamAccountClients.get(accountName) ?? null
  }

  hasAccountName(accountName: string) {
    return this.steamAccountClients.has(accountName)
  }

  getAccountsStatus() {
    const accountStatus = {} as Record<string, { farming: boolean }>
    this.steamAccountClients.forEach((client, accountName) => {
      accountStatus[accountName] = {
        farming: client.isFarming(),
      }
    })
    return accountStatus
  }
}
