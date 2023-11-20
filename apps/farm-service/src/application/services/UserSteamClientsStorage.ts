import { ApplicationError } from "core"
import { UserSteamClient } from "~/application/services/steam"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { Publisher } from "~/infra/queue"

type UserSteamClientMapStorage = Map<string, Map<string, UserSteamClient>>

export class UserSteamClientsStorage {
  users: UserSteamClientMapStorage = new Map()

  constructor(
    private readonly publisher: Publisher,
    private readonly steamBuilder: SteamBuilder
  ) {}

  getOrAddSteamAccount({ accountName, userId, username }: AddUserProps) {
    const userSteamClient = this.users.get(userId)?.get(accountName)
    if (!userSteamClient) return this.addSteamAccount({ accountName, userId, username })
    return { userSteamClient }
  }

  addSteamAccount({ accountName, userId, username }: AddUserProps): { userSteamClient: UserSteamClient } {
    const userSteamClient = new UserSteamClient({
      props: { client: this.steamBuilder.create(), userId, username },
      instances: { publisher: this.publisher },
    })
    const userSteamAccounts = this.users.get(userId)
    if (!userSteamAccounts) {
      this.users.set(userId, new Map().set(accountName, userSteamClient))
      return { userSteamClient }
    }

    return { userSteamClient }
  }

  get(userId: string, accountName: string) {
    const userSteamAccounts = this.users.get(userId)
    if (!userSteamAccounts) {
      throw new ApplicationError("Esse usuário não possui contas da Steam ativas na plataforma.", 406)
    }
    const userSteamClient = userSteamAccounts.get(accountName)
    if (!userSteamClient) {
      throw new ApplicationError("Essa Steam Accuont não possui contas da Steam ativas na plataforma.", 406)
    }
    return { userSteamClient }
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
