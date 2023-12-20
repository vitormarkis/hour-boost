import { FarmSessionExpiredMidFarmCommand } from "~/application/commands/PlanUsageExpiredMidFarmCommand"
import { EventNames, Observer } from "~/infra/queue"

export class LogPlanExpiredMidFarm implements Observer {
  operation: EventNames = "plan-usage-expired-mid-farm"

  async notify(command: FarmSessionExpiredMidFarmCommand): Promise<void> {
    console.log(
      `[PLAN-EXPIRED-MID-FARM]: Plano de ${
        command.username
      } expirou em ${command.when.toUTCString()} enquanto farmava.`
    )
  }
}
