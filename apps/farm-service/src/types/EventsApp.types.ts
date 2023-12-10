import { EventParameters } from "~/infra/services"

export type EventMapperGeneric = Record<string, any[]>

export type FarmGamesEventsGenericResolve =
  | FarmGamesEventsResolve<EventParameters>
  | FarmGamesEventsTimeoutResolve

export type FarmGamesEventsResolve<EventMapper extends EventMapperGeneric> = {
  [K in keyof EventMapper]: SingleEventResolver<EventMapper, K>
}[keyof EventMapper]

export type SingleEventResolver<EventMapper extends EventMapperGeneric, K extends keyof EventMapper> = {
  type: K
  args: EventMapper[K]
}

export type FarmGamesEventsTimeoutResolve<EventMapper extends EventMapperGeneric = EventParametersTimeout> = {
  [K in keyof EventMapper]: {
    type: K
    args: EventMapper[K]
  }
}[keyof EventMapper]

export type EventParametersTimeout = {
  timeout: []
}
