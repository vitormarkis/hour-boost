import { Command } from "~/application/commands"

export type EventNames =
  | "user-has-start-farming"
  | "user-complete-farm-session-usage"
  | "user-complete-farm-session-infinity"
  | "user-farmed"
  | "user-complete-farm-session"
  | "STEAMCLIENT:add-more-games"
  | "STEAMCLIENT:paused-some-games"
  | "STEAMCLIENT:start-farming"
  | "STEAMCLIENT:stop-farming"

export interface Observer {
  operation: EventNames
  notify(command: Command): Promise<void>
}
