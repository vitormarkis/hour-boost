import { ApplicationError, Controller, HttpClient } from "core"
import { AllUsersClientsStorage } from "~/application/services"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { makeRes } from "~/utils"
import { SteamClientEventsRequired } from "~/utils/SteamClientEventsRequired"

export namespace AddSteamGuardCodeHandle {
  export type Payload = {
    code: string
    userId: string
    accountName: string
  }

  export type Response = {}
}

export class AddSteamGuardCodeController
  implements Controller<AddSteamGuardCodeHandle.Payload, AddSteamGuardCodeHandle.Response>
{
  constructor(private readonly allUsersClientsStorage: AllUsersClientsStorage) {}
  async handle({ payload }: APayload): AResponse {
    const { userId, accountName, code } = payload
    const { userSteamClients } = this.allUsersClientsStorage.getOrNull(userId) ?? {}
    if (!userSteamClients)
      throw new ApplicationError(
        "Falha ao adicionar código Steam Guard. Usuário nunca tentou fazer login com essa conta."
      )
    const sac = userSteamClients.getAccountClientOrThrow(accountName)
    if (!sac) throw new ApplicationError("User never tried to log in.")

    const onSteamGuard = sac.getManualHandler("steamGuard")
    console.log("settando o steam guard")
    onSteamGuard(code)

    const steamClientEventsRequired = new SteamClientEventsRequired(sac, EVENT_PROMISES_TIMEOUT_IN_SECONDS)

    const eventsPromisesResolved = await Promise.race(
      steamClientEventsRequired.getEventPromises({
        loggedOn: true,
        steamGuard: true,
        error: true,
        timeout: true,
      })
    )

    console.log({
      eventsPromisesResolved,
    })
    if (eventsPromisesResolved.type === "loggedOn") {
      // 22: persistir auth code

      return {
        status: 200,
        json: eventsPromisesResolved.args,
      }
    }
    if (eventsPromisesResolved.type === "steamGuard") {
      return makeRes(202, "Steam Guard required again.")
    }
    throw new ApplicationError("Bad resolver, didn't throw or returned logged in event.")
  }
}

type APayload = HttpClient.Request<AddSteamGuardCodeHandle.Payload>
type AResponse = Promise<HttpClient.Response<AddSteamGuardCodeHandle.Response>>
