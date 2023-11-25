import { ApplicationError } from "core"
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
      return this.addSteamAccount({ accountName, userId, username })
    }
    return { steamAccountClient: this.users.get(userId)?.getAccountClient(accountName).steamAccountClient }
  }

  addSteamAccount({ accountName, userId, username }: AddUserProps): {
    steamAccountClient: SteamAccountClient
  } {
    const steamAccountClient = new SteamAccountClient({
      props: {
        client: this.steamBuilder.create(),
        userId,
        username,
        accountName,
      },
      instances: {
        publisher: this.publisher,
      },
    })

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
    return Object.entries(this.users).reduce(
      (acc, [key, value]) => {
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
