import { ApplicationError, PlanType, PlanUsage, Usage } from "core"

import { UserCompleteFarmSessionCommand, UserHasStartFarmingCommand } from "~/application/commands"
import { PlanUsageExpiredMidFarmCommand } from "~/application/commands/PlanUsageExpiredMidFarmCommand"
import { UserFarmedCommand } from "~/application/commands/UserFarmedCommand"
import { FarmServiceStatus, IFarmService } from "~/application/services"
import { Publisher } from "~/infra/queue"

export const FARMING_INTERVAL_IN_SECONDS = 1

export class FarmUsageService implements IFarmService {
  private readonly publisher: Publisher

  FARMING_GAP = FARMING_INTERVAL_IN_SECONDS
  farmingInterval: NodeJS.Timeout | undefined
  currentFarmingUsage = 0
  status: FarmServiceStatus = "IDDLE"
  type: PlanType = "USAGE"
  readonly planId: string
  readonly ownerId: string
  readonly username: string
  readonly usageLeft: number
  private startedAt: Date = new Date()

  constructor(publisher: Publisher, plan: PlanUsage, username: string) {
    if (!(plan instanceof PlanUsage))
      throw new ApplicationError("Tentativa de fazer usage farm com plano que não é do tipo USAGE.")
    this.planId = plan.id_plan
    this.ownerId = plan.ownerId
    this.publisher = publisher
    this.username = username
    this.usageLeft = plan.getUsageLeft()
  }

  startFarm() {
    this.status = "FARMING"
    this.startedAt = new Date()
    if (this.usageLeft <= 0) throw new ApplicationError("Seu plano não possui mais uso disponível.")
    this.farmingInterval = setInterval(() => {
      if (this.currentFarmingUsage > this.usageLeft) {
        const { usage } = this.stopFarm()
        this.publisher.publish(
          new PlanUsageExpiredMidFarmCommand({
            planId: this.planId,
            usage,
            userId: this.ownerId,
            when: new Date(),
          })
        )
        return
      }
      this.currentFarmingUsage += this.FARMING_GAP
      this.publisher.publish(
        new UserFarmedCommand({ amount: this.FARMING_GAP, username: this.username, when: new Date() })
      )
      // no front, subtrair o valor farmedValue do usageLeft
    }, this.FARMING_GAP * 1000).unref()

    this.publisher.publish(
      new UserHasStartFarmingCommand({
        when: new Date(),
        planId: this.planId,
        userId: this.ownerId,
      })
    )
  }

  stopFarm(): { usage: Usage } {
    this.status = "IDDLE"
    clearInterval(this.farmingInterval)

    const usage = Usage.create({
      amountTime: this.currentFarmingUsage,
      createdAt: this.startedAt,
      plan_id: this.planId,
    })

    this.publisher.publish(
      new UserCompleteFarmSessionCommand({
        planId: this.planId,
        usage,
        userId: this.ownerId,
        username: this.username,
        when: new Date(),
        farmStartedAt: this.startedAt,
      })
    )

    this.currentFarmingUsage = 0
    return { usage }
  }
}
