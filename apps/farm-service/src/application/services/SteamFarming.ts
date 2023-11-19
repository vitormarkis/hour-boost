import SteamUser from "steam-user"
import { UserSteamClient } from "~/application/services/steam"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { Publisher } from "~/infra/queue"

type UserID = string

export class SteamFarming {
  farmingUsers: Map<UserID, UserSteamClient> = new Map()

  constructor(
    private readonly publisher: Publisher,
    private readonly steamBuilder: SteamBuilder
  ) {}

  addUser(userId: string, username: string) {
    const userSteamClient = new UserSteamClient({
      props: {
        client: this.steamBuilder.create(),
        userId,
        username,
      },
      instances: {
        publisher: this.publisher,
      },
    })
    this.farmingUsers.set(userId, userSteamClient)
    return { userSteamClient }
  }

  getUser(userId: string) {
    const userSteamClient = this.farmingUsers.get(userId) ?? null
    return { userSteamClient }
  }

  getSteamClient(userId: string): Record<string, any> | null {
    return this.farmingUsers.get(userId) ?? null
  }

  listUsers() {
    return Object.entries(this.farmingUsers).reduce(
      (acc, [key, value]) => {
        const [classWord, instance] = value.constructor.toString().split(" ")
        acc[key] = `${classWord} ${instance}`
        return acc
      },
      {} as Record<string, string>
    )
  }
}
