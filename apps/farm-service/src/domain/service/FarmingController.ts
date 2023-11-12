import { UsersRepository } from "core"
import { UserFarmService } from "~/domain/service/UserFarmService"
import { Publisher } from "~/infra/queue"

export class FarmingController {
  readonly farmingUsers: Map<string, UserFarmService> = new Map()

  constructor(
    private readonly publisher: Publisher,
    private readonly usersRepository: UsersRepository
  ) {}

  async startFarm(userId: string) {
    const user = await this.usersRepository.getByID(userId)
    if (!user) {
      console.log({ userId_NOT_FOUND: userId })
      throw new Error("User not found")
    }
    const farmingUser = this.farmingUsers.get(user.username)
    if (!farmingUser) {
      const userFarmService = new UserFarmService(this.publisher, user)
      this.farmingUsers.set(userFarmService.username, userFarmService)
      userFarmService.startFarm()
      return
    }
    farmingUser.startFarm()
  }

  async stopFarm(userId: string) {
    const user = await this.usersRepository.getByID(userId)
    if (!user) {
      console.log({ userId_NOT_FOUND: userId })
      throw new Error("User not found")
    }
    const farmingUser = this.farmingUsers.get(user.username)
    if (!farmingUser) {
      const farmingUsers = Object.keys(Object.fromEntries(this.farmingUsers.entries()))
      console.log({ farmingUsers })
      throw new Error("User is not farming")
    }
    farmingUser.stopFarm()
  }

  listFarmingStatusCount() {
    let FARMING = 0
    let IDDLE = 0
    this.farmingUsers.forEach(user => {
      if (user.status === "FARMING") ++FARMING
      if (user.status === "IDDLE") ++IDDLE
    })

    return {
      FARMING,
      IDDLE,
    }
  }
}
