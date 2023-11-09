import { EventNames, Publisher } from "../UserFarmService"

export function makePublisher(): Publisher {
  const eventHandlers: Map<EventNames, Function[]> = new Map()

  return {
    emit(eventName, data) {
      const event = eventHandlers.get(eventName)
      if (!event) return
      for (const handler of event) {
        console.log("chamando todos handlers!", event)
        handler(data)
      }
    },
    register(eventName, handler) {
      const eventCurrentEventHandlers = eventHandlers.get(eventName)
      if (!eventCurrentEventHandlers) eventHandlers.set(eventName, [])
      eventHandlers.get(eventName)?.push(handler)
      return () => eventHandlers.get(eventName)?.filter(cb => cb !== handler)
    },
  }
}
