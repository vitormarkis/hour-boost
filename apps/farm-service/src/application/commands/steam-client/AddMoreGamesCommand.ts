import type { Command } from "~/application/commands/Command"
import type { EventNames } from "~/infra/queue"

interface AddMoreGamesCommandProps {
  when: Date
  newGames: number[]
}

export class AddMoreGamesCommand implements Command {
  operation: EventNames = "STEAMCLIENT:add-more-games"
  newGames: number[]
  when: Date

  constructor(props: AddMoreGamesCommandProps) {
    this.when = props.when
    this.newGames = props.newGames
  }
}
