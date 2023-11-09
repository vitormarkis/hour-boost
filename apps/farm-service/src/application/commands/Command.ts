import { EventNames } from "../../UserFarmService"

export type Command<T extends object = object> = T & {
  operation: EventNames
}
