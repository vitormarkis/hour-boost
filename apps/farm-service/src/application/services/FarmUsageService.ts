import { PlanType, PlanUsage, Usage } from "core"

import { Command, UserCompleteFarmSessionCommand, UserHasStartFarmingCommand } from "~/application/commands"
import { FarmServiceStatus, IFarmService } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { PlanUsageExpiredMidFarmCommand } from "~/domain/handler"

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
      throw new Error("Tentativa de fazer usage farm com plano que não é do tipo USAGE.")
    this.planId = plan.id_plan
    this.ownerId = plan.ownerId
    this.publisher = publisher
    this.username = username
    this.usageLeft = plan.getUsageLeft()
  }

  startFarm() {
    this.status = "FARMING"
    this.startedAt = new Date()
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
        createdAt: this.startedAt,
        plan_id: this.planId,
      }),
      planId: this.planId,
      userId: this.ownerId,
      username: this.username,
    } as UserCompleteFarmSessionCommand)

    this.currentFarmingUsage = 0
  }
}
