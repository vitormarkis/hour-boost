import {
  AddSteamAccount,
  AddSteamAccountOutput,
  ApplicationError,
  IAddSteamAccount,
  UsersDAO,
  UsersRepository,
} from "core"
import { UserSteamClientsStorage } from "~/application/services"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"

import { HttpClient } from "~/contracts/HttpClient"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { loginErrorMessages } from "~/presentation/routes"
import { getTimeoutPromise, makeResError } from "~/utils"

export type Resolved = {
  json: {
    message: string
  } & Record<string, any>
  status: number
}
export class AddSteamAccountController {
  constructor(
    private readonly addSteamAccount: AddSteamAccount,
    private readonly steamFarming: UserSteamClientsStorage,
    private readonly usersDAO: UsersDAO
  ) {}

  async handle(req: HttpClient.Request<IAddSteamAccount>): Promise<HttpClient.Response> {
    const perform = async () => {
      const { accountName, password, userId } = req.payload
      const { username } = (await this.usersDAO.getUsername(userId)) ?? {}
      if (!username) throw new ApplicationError("No user found with this ID.")

      const { userSteamClient: usc } = this.steamFarming.addSteamAccount({
        accountName,
        userId,
        username: username,
      })
      usc.login(accountName, password)

      try {
        const { status, json } = await Promise.race([
          new Promise<Resolved>((res, rej) => {
            usc.client.on("loggedOn", async () => {
              this.addSteamAccount
                .execute({
                  accountName,
                  password,
                  userId,
                })
                .then(({ steamAccountID }) => {
                  res({
                    json: { message: `${accountName} adicionada com sucesso!`, steamAccountID },
                    status: 201,
                  })
                })
                .catch(rej)
            })
          }),
          new Promise<Resolved>((res, rej) => {
            usc.client.on("steamGuard", domain => {
              res({
                json: { message: `CLX: Sending code to email ${domain}` },
                status: 200,
              })
            })
          }),
          new Promise<Resolved>((res, rej) => {
            usc.client.on("error", error => {
              res({
                json: {
                  message: `CLX: Error of type ${loginErrorMessages[error.eresult]}`,
                  error,
                },
                status: 400,
              })
            })
          }),
          getTimeoutPromise<Resolved>(EVENT_PROMISES_TIMEOUT_IN_SECONDS, {
            json: {
              message: "Server timed out.",
            },
            status: 400,
          }),
        ])
        return {
          status,
          json,
        } as HttpClient.Response
      } catch (error) {
        throw error
      }
    }

    return promiseHandler(perform())
  }
}
