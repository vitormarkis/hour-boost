import { Command } from "~/application/commands"

export type EventNames =
  | "user-has-start-farming"
  | "user-complete-farm-session"
  | "user-pause-infinity-farm-session-command"
  | "plan-usage-expired-mid-farm"
  | "user-farmed"

export interface Observer {
  operation: EventNames
  notify(command: Command): Promise<void>
}
