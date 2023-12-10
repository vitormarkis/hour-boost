import { ApplicationError } from "core"
import { AllUsersClientsStorage } from "~/application/services"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { HttpClient } from "~/contracts"
import { SteamClientEventsRequired } from "~/presentation/controllers"
import { makeRes } from "~/utils"

export class AddSteamGuardCodeController {
  constructor(private readonly allUsersClientsStorage: AllUsersClientsStorage) {}

  async handle({
    payload: { accountName, code, userId },
  }: HttpClient.Request<IAddSteamGuardCode>): Promise<HttpClient.Response> {
    const { userSteamClients } = this.allUsersClientsStorage.getOrNull(userId) ?? {}
    if (!userSteamClients)
      throw new ApplicationError(
        "Falha ao adicionar código Steam Guard. Usuário nunca tentou fazer login com essa conta."
      )
    const { steamAccountClient: sac } = userSteamClients.getAccountClient(accountName)
    if (!sac) throw new ApplicationError("User never tried to log in.")

    // console.log({
    // 	id: sac.client.isSame,
    // 	onSteamGuard,
    // 	code
    // })

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

export interface IAddSteamGuardCode {
  code: string
  userId: string
  accountName: string
}
