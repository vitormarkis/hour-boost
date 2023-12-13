import { EventEmitter, EventsTuple } from "~/application/services"
import { Builder } from "~/utils/builders/builder.interface"

export class EventEmitterBuilder implements Builder<EventEmitter> {
  create(): EventEmitter<EventsTuple> {
    return new EventEmitter()
  }
}
