import { Usage, User, makeID } from "core"
import { UserHasFarmedCommand } from "./queue/commands/UserHasFarmedCommand"
import { UserCompleteFarmSessionCommand } from "./queue/commands/UserCompleteFarmSessionCommand"

export type EventNames = "user-has-farmed" | "user-complete-farm-session"

export interface Publisher {
  emit(eventName: EventNames, data?: any): void
  register(eventName: EventNames, handler: Function): Function
}

export class UserFarmService {
  FARMING_GAP = 1
  farmingInterval: NodeJS.Timeout | undefined
  currentFarmingUsage: number = 0

  constructor(
    private readonly publisher: Publisher,
    private readonly user: User
  ) {}

  startFarm() {
    this.currentFarmingUsage = 0
    if (!this.user.plan.isFarmAvailable) {
      throw new Error("Seu plano não possui mais horas disponíveis.")
    }
    const usageLeftSnapshot = this.user.plan.getTimeLeft()
    this.farmingInterval = setInterval(() => {
      if (this.currentFarmingUsage + this.FARMING_GAP >= usageLeftSnapshot) {
        console.log("Farm automatico pausado. Usuario gastou todas as horas do plano!")
        this.stopFarm()
      }
      console.log(`INTERNAL: Adding ${this.FARMING_GAP} to ${this.currentFarmingUsage}`)
      this.currentFarmingUsage += this.FARMING_GAP
    }, this.FARMING_GAP * 1000)
  }

  stopFarm() {
    const usage = new Usage(makeID(), new Date(), this.currentFarmingUsage)
    clearInterval(this.farmingInterval)
    this.publisher.emit(
      "user-complete-farm-session",
      new UserCompleteFarmSessionCommand({
        id_user: this.user.id_user,
        usageLeft: this.user.plan.getTimeLeft(),
        username: this.user.username,
        planId: this.user.plan.id_plan,
        usage,
      })
    )
    this.currentFarmingUsage = 0
  }
}

// this.publisher.emit(
//   "user-has-farmed",
//   new UserHasFarmedCommand({
//     id_user: this.user.id_user,
//     usageLeft: this.user.plan.getTimeLeft(),
//     username: this.user.username,
//     planId: this.user.plan.id_plan,
//   })
// )
