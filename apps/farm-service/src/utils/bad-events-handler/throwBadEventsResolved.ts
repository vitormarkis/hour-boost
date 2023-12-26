import { ApplicationError, HttpClient } from "core"
import { EventParameters } from "~/infra/services/SteamUserMock"
import {
  EventMapperGeneric,
  EventParametersTimeout,
  FarmGamesEventsGenericResolve,
} from "~/types/EventsApp.types"
import { makeRes } from "~/utils/makeResError"

export function throwBadEventsResolved(events: FarmGamesEventsGenericResolve): BadEventsResponse {
  if (events.type === "loggedOn") return handleBadEventLoggedOn(events.args)
  if (events.type === "steamGuard") return handleBadEventSteamGuard(events.args)
  if (events.type === "error") return handleBadEventError(events.args)
  if (events.type === "timeout") return handleBadEventTimeout(events.args)
  console.log({ when: new Date(), events })
  throw new ApplicationError("Tipo de evento recebido é inválido.")
}

function handleBadEventLoggedOn(args: EventParameters["loggedOn"]): BadEventsResponse {
  return { eventName: "loggedOn", args, interrupt: false }
}

function handleBadEventSteamGuard(args: EventParameters["steamGuard"]): BadEventsResponse {
  const [domain] = args
  return {
    args,
    eventName: "steamGuard",
    interrupt: true,
    httpResponse: makeRes(
      202,
      `Steam Guard requerido. Enviando para ${domain ? `e-mail com final ${domain}` : `seu celular.`}`
    ),
  }
}

function handleBadEventError(args: EventParameters["error"]): BadEventsResponse {
  const [error] = args

  const errorResponseMapper: Record<number, HttpClient.Response> = {
    18: makeRes(
      404,
      "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente."
    ),
  }

  const { status, json } = errorResponseMapper[error.eresult] ?? {
    status: 500,
    json: {
      message: "Unexpected Steam Client error.",
    },
  }

  return {
    args,
    eventName: "error",
    interrupt: true,
    httpResponse: {
      status,
      json: {
        ...json,
        ...error,
      },
    },
  }
}

function handleBadEventTimeout(args: EventParametersTimeout["timeout"]): BadEventsResponse {
  return {
    args,
    eventName: "timeout",
    httpResponse: makeRes(400, "Request timeout, nenhum evento do client foi disparado."),
    interrupt: true,
  }
}

type BadEventsResponse<EventMapper extends EventMapperGeneric = EventParameters & EventParametersTimeout> = {
  [K in keyof EventMapper]: {
    eventName: K
    args: EventMapper[K]
  }
}[keyof EventMapper] &
  (
    | {
        interrupt: true
        httpResponse: HttpClient.Response
      }
    | {
        interrupt: false
      }
  )
