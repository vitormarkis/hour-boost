import { Usage } from "core"
import { Command } from "~/application/commands"
import { EventNames } from "~/infra/queue"

export class FarmSessionExpiredMidFarmCommand implements Command {
  operation: EventNames = "plan-usage-expired-mid-farm"
  when: Date
  usages: Usage[]
  planId: string
  userId: string
  username: string

  constructor(props: FarmSessionExpiredMidFarmCommandProps) {
    this.when = props.when
    this.usages = props.usages
    this.planId = props.planId
    this.userId = props.userId
    this.username = props.username
  }
}

interface FarmSessionExpiredMidFarmCommandProps {
  when: Date
  usages: Usage[]
  planId: string
  userId: string
  username: string
}
