import { UserFarmedCommand } from "~/application/commands/UserFarmedCommand"
import { EventNames, Observer } from "~/infra/queue"

export class LogUserFarmedHandler implements Observer {
  operation: EventNames = "user-farmed"

  async notify({ amount, username }: UserFarmedCommand): Promise<void> {
    console.log(`${username} farmed more ${amount} seconds.`)
  }
}
