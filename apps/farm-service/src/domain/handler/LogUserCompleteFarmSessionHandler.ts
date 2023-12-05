import { UserCompleteFarmSessionCommand } from "~/application/commands"
import { logDate } from "~/domain/handler/LogSteamStartFarmHandler"
import { EventNames, Observer } from "~/infra/queue"

export class LogUserCompleteFarmSessionHandler implements Observer {
  operation: EventNames = "user-complete-farm-session"

  async notify({ usage, username, when, farmStartedAt }: UserCompleteFarmSessionCommand): Promise<void> {
    const whenItShouldStart = new Date(when.getTime() - usage.amountTime * 1000)
    console.log(
      `${username} completou uma sessão de farm, que começou em ${logDate(farmStartedAt)}, durou ${
        usage.amountTime
      } segundos, e DEVE ter acabado em ${logDate(when)}, mas deveria ter começado em ${logDate(
        whenItShouldStart
      )}.`
    )
  }
}
