import type { Command } from "~/application/commands"
import type { Observer } from "~/infra/queue/Observer"

export class Publisher {
  observers: Observer[]

  constructor() {
    this.observers = []
  }

  register(observer: Observer) {
    this.observers.push(observer)
  }

  publish(command: Command) {
    for (const observer of this.observers) {
      if (observer.operation === command.operation) {
        observer.notify(command)
      }
    }
  }
}
