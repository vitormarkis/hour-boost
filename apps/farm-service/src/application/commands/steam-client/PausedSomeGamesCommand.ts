import type { Command } from "~/application/commands/Command"
import type { EventNames } from "~/infra/queue"

interface PausedSomeGamesCommandProps {
  when: Date
}

export class PausedSomeGamesCommand implements Command {
  operation: EventNames = "STEAMCLIENT:paused-some-games"
  when: Date

  constructor(props: PausedSomeGamesCommandProps) {
    this.when = props.when
  }
}
