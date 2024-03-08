import type { Fail } from "core"
import type { EventParameters } from "~/infra/services"

export type EventMapperGeneric = Record<string, any[]>

export type FarmGamesEventsGenericResolve =
  | FarmGamesEventsResolve<EventParameters>
  | FarmGamesEventsTimeoutResolve

export type FarmGamesEventsResolve<EventMapper extends EventMapperGeneric> = {
  [K in keyof EventMapper]: SingleEventResolver<EventMapper, K>
}[keyof EventMapper]

export class SingleEventResolver<
  EventMapper extends EventMapperGeneric = EventMapperGeneric,
  K extends keyof EventMapper = keyof EventMapper,
> {
  type: K
  args: EventMapper[K]

  constructor(props: { type: K; args: EventMapper[K] }) {
    this.type = props.type as K
    this.args = props.args as EventMapper[K]
  }
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

export type FailGeneric = Fail<string, number, undefined | Record<string, any>>
