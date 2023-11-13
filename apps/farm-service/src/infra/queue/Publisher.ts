import { Command } from "~/application/commands"
import { Observer } from "~/infra/queue/Observer"

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
        if (observer.operation === "user-complete-farm-session")
          console.log({
            beingCalledWith: command,
          })
        observer.notify(command)
      }
    }
  }
}
