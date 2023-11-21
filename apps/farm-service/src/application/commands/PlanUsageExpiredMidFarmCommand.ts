import { Usage } from "core"
import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class PlanUsageExpiredMidFarmCommand implements Command {
  operation: EventNames = "plan-usage-expired-mid-farm"
  when: Date
  usages: Usage[]
  planId: string
  userId: string

  constructor(props: PlanUsageExpiredMidFarmCommandProps) {
    this.when = props.when
    this.usages = props.usages
    this.planId = props.planId
    this.userId = props.userId
  }
}

interface PlanUsageExpiredMidFarmCommandProps {
  when: Date
  usages: Usage[]
  planId: string
  userId: string
}
