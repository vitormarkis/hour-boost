import { EventEmitter, type EventsTuple } from "~/application/services"
import type { Builder } from "~/utils/builders/builder.interface"

export class EventEmitterBuilder implements Builder<EventEmitter> {
  create(): EventEmitter<EventsTuple> {
    return new EventEmitter()
  }
}
