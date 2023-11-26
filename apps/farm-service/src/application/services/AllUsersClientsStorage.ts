import { ApplicationError, UsersDAO } from "core"
import SteamUser from "steam-user"
import { UserClientsStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
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
      console.log("creating a new sac and adding")
      const steamAccountClient = new SteamAccountClient({
        instances: {
          publisher: this.publisher,
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
    console.log("found a sac, return sac")
    return { steamAccountClient: this.users.get(userId)?.getAccountClient(accountName).steamAccountClient }
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
      console.log(`Adding client to storage with ${steamAccountClient.accountName}`)
      this.addUser(userId, userClientsStorage)
      return { steamAccountClient }
    }
    console.log(`Adding client to storage with ${steamAccountClient.accountName}`)
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
    return Object.entries(this.users.entries()).map(s => {
      console.log(s)
      return s
    })
    return Object.entries(this.users).reduce(
      (acc, [key, value]) => {
        console.log(acc, key, value)
        const [classWord, instance] = value.constructor.toString().split(" ")
        acc[key] = `${classWord} ${instance}`
        return acc
      },
      {} as Record<string, string>
    )
  }
}

export type AddUserProps = {
  userId: string
  username: string
  accountName: string
}
