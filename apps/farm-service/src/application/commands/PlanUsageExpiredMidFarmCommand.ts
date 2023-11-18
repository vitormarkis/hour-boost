import { Usage } from "core"
import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class PlanUsageExpiredMidFarmCommand implements Command {
  operation: EventNames = "plan-usage-expired-mid-farm"
  when: Date
  usage: Usage
  planId: string
  userId: string

  constructor(props: PlanUsageExpiredMidFarmCommandProps) {
    this.when = props.when
    this.usage = props.usage
    this.planId = props.planId
    this.userId = props.userId
  }
}

interface PlanUsageExpiredMidFarmCommandProps {
  when: Date
  usage: Usage
  planId: string
  userId: string
}
