import type { CacheStateDTO } from "core"
import type { Command } from "~/application/commands"
import type { EventNames } from "~/infra/queue"

export class PlanMaxUsageExceededCommand implements Command {
  operation: EventNames = "PLAN-MAX-USAGE-EXCEEDED"
  when: Date
  state: CacheStateDTO

  constructor(props: PlanMaxUsageExceededCommandProps) {
    this.when = props.when
    this.state = props.state
  }
}

interface PlanMaxUsageExceededCommandProps {
  when: Date
  state: CacheStateDTO
}
