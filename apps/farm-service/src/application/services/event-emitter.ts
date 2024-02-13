type ArgsTuple = any[]
type CallbackResolver = (...args: any[]) => void
export type EventsTuple = Record<string, ArgsTuple>
type EventHandler<T extends ArgsTuple> = (...args: T) => void
type EventHandlers<T extends ArgsTuple> = EventHandler<T>[]
type HandlersMapping<Events extends EventsTuple> = {
  [K in keyof Events]: EventHandlers<Events[K]>
}
type ResolversMapping<Events extends EventsTuple> = {
  [K in keyof Events]: CallbackResolver
}

export class EventEmitter<EventArgs extends EventsTuple = EventsTuple> {
  private handlers: Partial<HandlersMapping<EventArgs>> = {}
  private resolvers: Partial<ResolversMapping<EventArgs>> = {}

  on<TEventName extends keyof EventArgs>(event: TEventName, handler: EventHandler<EventArgs[TEventName]>) {
    const eventHandlers = this.handlers[event] as EventHandlers<EventArgs[TEventName]>
    if (!eventHandlers) {
      this.handlers[event] = [handler]
      return
    }
    eventHandlers.push(handler)
  }

  once<TEventName extends keyof EventArgs>(event: TEventName, handler: EventHandler<EventArgs[TEventName]>) {
    const handlerTemp = (...args: EventArgs[TEventName]) => {
      handler(...args)
      this.off(event, handlerTemp)
    }
    this.on(event, handlerTemp)
  }

  off<TEventName extends keyof EventArgs>(event: TEventName, handler: EventHandler<EventArgs[TEventName]>) {
    const eventHandlers = this.handlers[event] as EventHandlers<EventArgs[TEventName]>
    if (eventHandlers) {
      const index = eventHandlers.indexOf(handler)
      if (index < 0) return
      eventHandlers.splice(index, 1)
    }
  }

  emit<TEventName extends keyof EventArgs>(event: TEventName, ...args: EventArgs[TEventName]) {
    const eventHandlers = this.handlers[event]
    if (!eventHandlers) return
    const { asyncHandlers, handlers } = getAsyncFunction(eventHandlers)
    for (const handler of handlers) {
      handler(...args)
    }
    const promises = asyncHandlers.map(asyncHandler => asyncHandler(...args))
    Promise.all(promises).finally(() => {
      const resolver = this.resolvers[event]
      if (!resolver) return
      resolver()
    })
  }

  setEventResolver<TEventName extends keyof EventArgs>(event: TEventName, callback: CallbackResolver) {
    console.log(`[event-handler]: setting the event [${event.toString()}] resolver`)
    this.resolvers[event] = callback
  }

  listAllListeners() {
    return this.handlers
  }

  listAllEventsWithListeners() {
    return Object.keys(this.handlers).length
  }

  listEventListeners<TEventName extends keyof EventArgs>(eventName: TEventName) {
    return this.handlers[eventName]
  }

  listEventListenersAmount<TEventName extends keyof EventArgs>(eventName: TEventName) {
    return this.handlers[eventName]?.length
  }

  listAllResolvers() {
    return this.resolvers
  }
}

type AsyncFunction = (...args: any[]) => Promise<any>
type RegularFunction = (...args: any[]) => any

export function getAsyncFunction(functions: Function[]) {
  const asyncHandlers: AsyncFunction[] = []
  const handlers: RegularFunction[] = []
  for (const fn of functions) {
    if (fn.constructor.name === "AsyncFunction") asyncHandlers.push(fn as AsyncFunction)
    else handlers.push(fn as RegularFunction)
  }
  return {
    asyncHandlers,
    handlers,
  }
}
