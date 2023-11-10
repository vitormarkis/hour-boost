import { Command } from "~/application/commands"

export type EventNames = "user-has-farmed" | "user-complete-farm-session"

export interface Observer {
  operation: EventNames
  notify(command: Command): Promise<void>
}
