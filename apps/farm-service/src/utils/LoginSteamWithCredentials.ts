import { ApplicationError, DataOrError } from "core"
import { SteamAccountClient } from "~/application/services/steam"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { EventPromises, SteamClientEventsRequired } from "~/utils/SteamClientEventsRequired"
import { nice, fail } from "~/utils/helpers"

export type Payload = {
  sac: SteamAccountClient
  accountName: string
  password: string
  trackEvents: EventPromises
  timeoutInSeconds?: number
}

abstract class ILoginSteamClientAwaitEvents {
  abstract execute(payload: Payload): Promise<DataOrError<any>>
}

export class LoginSteamWithCredentials implements ILoginSteamClientAwaitEvents {
  constructor() {}

  async execute({
    sac,
    accountName,
    password,
    timeoutInSeconds = EVENT_PROMISES_TIMEOUT_IN_SECONDS,
    trackEvents,
  }: Payload) {
    const steamClientEventsRequired = new SteamClientEventsRequired(sac, timeoutInSeconds)

    sac.login(accountName, password)

    const eventsPromisesResolved = await Promise.race(steamClientEventsRequired.getEventPromises(trackEvents))

    if (eventsPromisesResolved.type === "loggedOn") {
      return nice(true)
    }

    return fail(
      new ApplicationError(
        "Wasn't able to connect to Steam.",
        400,
        undefined,
        "WAS_NOT_ABLE_TO_CONNECT_TO_STEAM",
        eventsPromisesResolved
      )
    )
  }
}
