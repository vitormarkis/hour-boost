import { EventNames } from "../../domain/service/UserFarmService"

export type Command<T extends object = object> = T & {
  operation: EventNames
}
