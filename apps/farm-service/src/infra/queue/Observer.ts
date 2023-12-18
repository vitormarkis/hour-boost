import { Command } from "~/application/commands"

export type EventNames =
  | "user-has-start-farming"
  | "user-complete-farm-session"
  | "user-complete-farm-session-usage"
  | "user-complete-farm-session-infinity"
  | "user-pause-infinity-farm-session-command"
  | "plan-usage-expired-mid-farm"
  | "user-farmed"
  | "STEAMCLIENT:add-more-games"
  | "STEAMCLIENT:paused-some-games"
  | "STEAMCLIENT:start-farming"
  | "STEAMCLIENT:stop-farming"

export interface Observer {
  operation: EventNames
  notify(command: Command): Promise<void>
}
