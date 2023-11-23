import { ApplicationError } from "core"
import { SteamAccountClient } from "~/application/services/steam"

type AccountName = string

export class UserClientsStorage {
  steamAccountClients: Map<AccountName, SteamAccountClient> = new Map()

  addAccountClient(client: SteamAccountClient) {
    this.steamAccountClients.set(client.accountName, client)
  }

  getAccountClient(accountName: string) {
    const steamAccountClient = this.steamAccountClients.get(accountName)
    if (!steamAccountClient)
      throw new ApplicationError("Essa Steam Account nunca foi logada no nosso servidor.")
    return { steamAccountClient }
  }

  hasAccountName(accountName: string) {
    return this.steamAccountClients.has(accountName)
  }
}
