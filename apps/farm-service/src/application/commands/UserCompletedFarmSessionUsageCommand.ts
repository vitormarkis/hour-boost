import { Command } from "~/application/commands"
import { FarmingAccountDetailsWithAccountName } from "~/application/services"
import { EventNames } from "~/infra/queue"

export class UserCompletedFarmSessionUsageCommand implements Command {
  operation: EventNames = "user-complete-farm-session-usage"
  when: Date
  planId: string
  farmingAccountDetails: FarmingAccountDetailsWithAccountName[]

  constructor(props: UserCompletedFarmSessionUsageCommandProps) {
    this.when = props.when
    this.planId = props.planId
    this.farmingAccountDetails = props.farmingAccountDetails
  }
}

interface UserCompletedFarmSessionUsageCommandProps {
  when: Date
  planId: string
  farmingAccountDetails: FarmingAccountDetailsWithAccountName[]
}
