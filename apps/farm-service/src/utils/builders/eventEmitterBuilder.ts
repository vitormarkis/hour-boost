import { EventEmitter, EventsTuple } from "~/application/services"

export function makeEventEmitter<T extends EventsTuple>() {
  return {
    create() {
      return new EventEmitter<T>()
    },
  }
}
