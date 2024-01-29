import { ApplicationError, DataOrError } from "core"
import { SteamAccountClient } from "~/application/services/steam"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { EventPromises, SteamClientEventsRequired } from "~/utils/SteamClientEventsRequired"
import { nice, bad } from "~/utils/helpers"

export type Payload = {
  sac: SteamAccountClient
  accountName: string
  password: string
  trackEvents: EventPromises
  timeoutInSeconds?: number
}

abstract class ILoginSteamWithCredentials {
  abstract execute(payload: Payload): Promise<DataOrError<any>>
}

export class LoginSteamWithCredentials implements ILoginSteamWithCredentials {
  constructor() {}

  async execute({
    sac,
    accountName,
    password,
    timeoutInSeconds = EVENT_PROMISES_TIMEOUT_IN_SECONDS,
    trackEvents,
  }: Payload) {
    const steamClientEventsRequired = new SteamClientEventsRequired(sac, timeoutInSeconds)

    const [errorLogginWithCredentials] = sac.login(accountName, password)
    if (errorLogginWithCredentials) {
      console.log("66: ", { errorLogginWithCredentials })
      return bad(
        new ApplicationError(
          "Não foi possível fazer login na conta da steam, tente novamente mais tarde.",
          errorLogginWithCredentials.httpStatus,
          undefined,
          errorLogginWithCredentials.code,
          errorLogginWithCredentials.payload
        )
      )
    }

    const eventsPromisesResolved = await Promise.race(steamClientEventsRequired.getEventPromises(trackEvents))

    if (eventsPromisesResolved.type === "loggedOn") {
      return nice(true)
    }

    return bad(
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
