import { PlanType, PlanUsage, Usage, User, UsersRepository } from "core"

import { Command, UserCompleteFarmSessionCommand, UserHasStartFarmingCommand } from "~/application/commands"
import { FarmServiceStatus, FarmStatusCount, IFarmService } from "~/application/services"
import { PlanUsageExpiredMidFarmCommand } from "~/domain/handler/PersistFarmSessionHandler"
import { Publisher } from "~/infra/queue"

export const FARMING_INTERVAL_IN_SECONDS = 1

export class FarmUsageService implements IFarmService {
  FARMING_GAP = FARMING_INTERVAL_IN_SECONDS
  farmingInterval: NodeJS.Timeout | undefined
  currentFarmingUsage = 0
  status: FarmServiceStatus = "IDDLE"
  type: PlanType = "USAGE"

  constructor(
    private readonly publisher: Publisher,
    private readonly usageLeft: number,
    private readonly planId: string,
    readonly ownerId: string,
    readonly username: string
  ) {}

  startFarm() {
    this.status = "FARMING"
    this.farmingInterval = setInterval(() => {
      if (this.currentFarmingUsage > this.usageLeft) {
        this.stopFarm()
        this.publisher.publish({
          operation: "plan-usage-expired-mid-farm",
        } as PlanUsageExpiredMidFarmCommand)
        return
      }
      this.currentFarmingUsage += this.FARMING_GAP
      this.publisher.publish({
        operation: "user-farmed",
        farmedValue: this.currentFarmingUsage,
      } as Command)
      // no front, subtrair o valor farmedValue do usageLeft
    }, this.FARMING_GAP * 1000).unref()

    this.publisher.publish(
      new UserHasStartFarmingCommand({
        planId: this.planId,
        userId: this.ownerId,
      })
    )
  }

  stopFarm(): void {
    this.status = "IDDLE"
    clearInterval(this.farmingInterval)

    this.publisher.publish({
      operation: "user-complete-farm-session",
      usage: Usage.create({
        amountTime: this.currentFarmingUsage,
        createdAt: new Date(),
        plan_id: this.planId,
      }),
      planId: this.planId,
      userId: this.ownerId,
      username: this.username,
    } as UserCompleteFarmSessionCommand)

    this.currentFarmingUsage = 0
  }

  listFarmingStatusCount(): FarmStatusCount {
    throw new Error("Method not implemented.")
  }
}

export type FarmUsageServiceExtraProps = {
  username: string
}

// if (!(this.plan instanceof PlanUsage))
// throw new Error(`O plano de ${this.extra.username} não é do tipo USAGE.`)
// if (!this.plan.isFarmAvailable()) {
// throw new Error("Seu plano não possui mais horas disponíveis.")
// }
// const usageLeftSnapshot = this.plan.getUsageLeft()

// this.publisher.emit(
//   "user-has-farmed",
//   new UserHasFarmedCommand({
//     id_user: this.user.id_user,
//     usageLeft: this.plan.getTimeLeft(),
//     username: this.extra.username,
//     planId: this.plan.id_plan,
//   })
// )
