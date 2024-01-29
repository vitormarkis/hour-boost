import { Command } from "~/application/commands"
import { AUTO_RESTARTER_INTERVAL_IN_SECONDS } from "~/consts"
import { EventNames } from "~/infra/queue"

export class ErrorOccuredOnSteamClientCommand implements Command {
  operation: EventNames = "error-occured-on-steam-client"
  when: Date
  accountName: string
  intervalInSeconds: number

  constructor(props: ErrorOccuredOnSteamClientCommandProps) {
    this.when = props.when
    this.accountName = props.accountName
    this.intervalInSeconds = props.intervalInSeconds ?? AUTO_RESTARTER_INTERVAL_IN_SECONDS
  }
}

interface ErrorOccuredOnSteamClientCommandProps {
  when: Date
  accountName: string
  intervalInSeconds?: number
}
