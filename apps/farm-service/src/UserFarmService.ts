import { Usage, User } from "core"

export const FARMING_INTERVAL_IN_SECONDS = 1
export type EventNames = "user-has-farmed" | "user-complete-farm-session"

export interface Publisher {
  emit(eventName: EventNames, data?: any): void
  register(eventName: EventNames, handler: Function): Function
}

export class UserFarmService {
  FARMING_GAP = FARMING_INTERVAL_IN_SECONDS
  farmingInterval: NodeJS.Timeout | undefined
  currentFarmingUsage = 0

  constructor(
    private readonly publisher: Publisher,
    private readonly user: User
  ) {}

  startFarm() {
    if (!this.user.plan.isFarmAvailable) {
      throw new Error("Seu plano não possui mais horas disponíveis.")
    }
    const usageLeftSnapshot = this.user.plan.getUsageLeft()
    this.farmingInterval = setInterval(() => {
      if (this.currentFarmingUsage > usageLeftSnapshot) {
        this.stopFarm()
        clearInterval(this.farmingInterval)
        throw new Error("Usos do plano acabaram!")
      }
      this.currentFarmingUsage += this.FARMING_GAP
    }, this.FARMING_GAP * 1000).unref()
  }

  stopFarm() {
    const usage = Usage.create({
      amountTime: this.currentFarmingUsage,
      createdAt: new Date(),
    })
    this.user.plan.use(usage)
  }
}
// this.publisher.emit(
//   "user-complete-farm-session",
//   new UserCompleteFarmSessionCommand({
//     id_user: this.user.id_user,
//     usageLeft: this.user.plan.getTimeLeft(),
//     username: this.user.username,
//     planId: this.user.plan.id_plan,
//     usage,
//   })
// )

// this.publisher.emit(
//   "user-has-farmed",
//   new UserHasFarmedCommand({
//     id_user: this.user.id_user,
//     usageLeft: this.user.plan.getTimeLeft(),
//     username: this.user.username,
//     planId: this.user.plan.id_plan,
//   })
// )
