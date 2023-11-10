import { EventNames } from "~/infra/queue"

export type Command<T extends object = object> = T & {
  operation: EventNames
}
