import { ApplicationError } from "core"
import { EventEmitter, UserClientsStorage } from "~/application/services"
import { SteamAccountClient, SteamApplicationEvents } from "~/application/services/steam"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { Publisher } from "~/infra/queue"

type UserID = string
export class AllUsersClientsStorage {
  users: Map<UserID, UserClientsStorage> = new Map()

  constructor(
    private readonly publisher: Publisher,
    private readonly steamBuilder: SteamBuilder
  ) {}

  getOrAddSteamAccount({ accountName, userId, username }: AddUserProps) {
    const userSteamClient = this.users.get(userId)?.hasAccountName(accountName)
    if (!userSteamClient) {
      const sacEmitter = new EventEmitter<SteamApplicationEvents>()
      const steamAccountClient = new SteamAccountClient({
        instances: {
          publisher: this.publisher,
          emitter: sacEmitter,
        },
        props: {
          accountName,
          client: this.steamBuilder.create(),
          userId,
          username,
        },
      })
      this.addSteamAccount(userId, steamAccountClient)
      return { steamAccountClient }
    }
    return {
      steamAccountClient: this.users.get(userId)?.getAccountClient(accountName).steamAccountClient,
    }
  }

  createSteamAccountClient({ accountName, userId, username }: AddUserProps) {}

  removeSteamAccount(userId: string, accountName: string) {
    const { userSteamClients } = this.get(userId)
    userSteamClients.removeAccountClient(accountName)
  }

  addSteamAccount(
    userId: string,
    steamAccountClient: SteamAccountClient
  ): {
    steamAccountClient: SteamAccountClient
  } {
    const userClientsStorage = this.users.get(userId)
    if (!userClientsStorage) {
      const userClientsStorage = new UserClientsStorage()
      userClientsStorage.addAccountClient(steamAccountClient)
      this.addUser(userId, userClientsStorage)
      return { steamAccountClient }
    }
    userClientsStorage.addAccountClient(steamAccountClient)
    return { steamAccountClient }
  }

  addUser(userID: string, userClientsStorage: UserClientsStorage) {
    this.users.set(userID, userClientsStorage)
  }

  get(userId: string) {
    const userSteamClients = this.users.get(userId)
    if (!userSteamClients) {
      throw new ApplicationError("Esse usuário não possui contas da Steam ativas na plataforma.", 406)
    }
    return { userSteamClients }
  }

  getOrNull(userId: string) {
    const userSteamClients = this.users.get(userId) ?? null
    return { userSteamClients }
  }

  getAccountClient(userID: string, accountName: string) {
    const { userSteamClients } = this.get(userID)
    const { steamAccountClient } = userSteamClients.getAccountClient(accountName)
    return { steamAccountClient }
    // return {
    //   const userSteamClient = userSteamAccounts.get(accountName)
    //   if (!userSteamClient) {
    //     throw new ApplicationError("Essa Steam Accuont não possui contas da Steam ativas na plataforma.", 406)
    //   }
    //   return { userSteamClient }
    // }
  }

  listUsers() {
    const usersIDs = {} as Record<string, Record<string, { farming: boolean }>>
    for (const [userId, client] of this.users.entries()) {
      usersIDs[userId] = client.getAccountsStatus()
    }
    return usersIDs
  }
}

export type AddUserProps = {
  userId: string
  username: string
  accountName: string
}
