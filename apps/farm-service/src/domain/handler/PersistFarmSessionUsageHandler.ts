import { PlanRepository, PlanUsage } from "core"
import { UserCompletedFarmSessionUsageCommand } from "~/application/commands/UserCompletedFarmSessionUsageCommand"
import { EventNames, Observer } from "~/infra/queue"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"

export class PersistFarmSessionUsageHandler implements Observer {
  operation: EventNames = "user-complete-farm-session-usage"

  constructor(
    private readonly planRepository: PlanRepository,
    private readonly usageBuilder: UsageBuilder
  ) {}

  async notify({ when, farmingAccountDetails, planId }: UserCompletedFarmSessionUsageCommand): Promise<void> {
    const plan = await this.planRepository.getById(planId)
    const usages = farmingAccountDetails.map(accountDetails => {
      return this.usageBuilder.create({
        accountName: accountDetails.accountName,
        amountTime: accountDetails.usageAmountInSeconds,
        createdAt: when,
        plan_id: planId,
      })
    })
    if (plan && plan instanceof PlanUsage) {
      for (const usage of usages) {
        plan.use(usage)
        console.log(`[BROKER]: [${usage.accountName}] farmou durante ${usage.amountTime} segundos.`)
      }
      await this.planRepository.update(plan)
    }
  }
}
