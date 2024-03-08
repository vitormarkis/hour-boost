import type SteamUser from "steam-user"
import type { Command } from "~/application/commands"
import type { EventNames } from "~/infra/queue"

export class ErrorOccuredOnSteamClientCommand implements Command {
  operation: EventNames = "error-occured-on-steam-client"
  when: Date
  accountName: string
  errorEResult: SteamUser.EResult

  constructor(props: ErrorOccuredOnSteamClientCommandProps) {
    this.when = props.when
    this.accountName = props.accountName
    this.errorEResult = props.errorEResult
  }
}

interface ErrorOccuredOnSteamClientCommandProps {
  when: Date
  accountName: string
  errorEResult: SteamUser.EResult
}
