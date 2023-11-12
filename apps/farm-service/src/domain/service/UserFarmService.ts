import { PlanUsage, Usage, User } from "core"

import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { Publisher } from "~/infra/queue"

export const FARMING_INTERVAL_IN_SECONDS = 1
export type EventNames = "user-has-farmed" | "user-complete-farm-session"
export type FarmServiceStatus = "FARMING" | "IDDLE"

export class UserFarmService {
  FARMING_GAP = FARMING_INTERVAL_IN_SECONDS
  farmingInterval: NodeJS.Timeout | undefined
  currentFarmingUsage = 0
  username: string
  status: FarmServiceStatus = "IDDLE"

  constructor(
    private readonly publisher: Publisher,
    private readonly user: User
  ) {
    this.username = user.username
  }

  startFarm() {
    if (!(this.user.plan instanceof PlanUsage))
      throw new Error(`O plano de ${this.user.username} não é do tipo USAGE.`)
    if (!this.user.plan.isFarmAvailable) {
      throw new Error("Seu plano não possui mais horas disponíveis.")
    }
    const usageLeftSnapshot = this.user.plan.getUsageLeft()
    this.runFarm(usageLeftSnapshot)
  }

  private runFarm(usageLeftSnapshot: number) {
    this.status = "FARMING"
    this.farmingInterval = setInterval(() => {
      if (this.currentFarmingUsage > usageLeftSnapshot) {
        this.stopFarm()
        throw new Error("Usos do plano acabaram!")
      }
      this.currentFarmingUsage += this.FARMING_GAP
    }, this.FARMING_GAP * 1000).unref()
  }

  stopFarm() {
    if (!(this.user.plan instanceof PlanUsage))
      throw new Error(`${this.user.username}'s plan don't have usages.`)
    this.status = "IDDLE"
    clearInterval(this.farmingInterval)
    const usage = Usage.create({
      amountTime: this.currentFarmingUsage,
      createdAt: new Date(),
      plan_id: this.user.plan.id_plan,
    })
    this.user.plan.use(usage)
    this.publisher.publish(
      new UserCompleteFarmSessionCommand({
        usage,
        usageLeft: this.user.plan.getUsageLeft(),
        username: this.user.username,
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
