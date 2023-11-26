import {
  AddSteamAccount,
  AddSteamAccountOutput,
  ApplicationError,
  IAddSteamAccount,
  UsersDAO,
  UsersRepository,
} from "core"
import { AllUsersClientsStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { EVENT_PROMISES_TIMEOUT_IN_SECONDS } from "~/consts"
import { SteamBuilder } from "~/contracts"

import { HttpClient } from "~/contracts/HttpClient"
import { Publisher } from "~/infra/queue"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { loginErrorMessages } from "~/presentation/routes"
import { getTimeoutPromise, makeResError } from "~/utils"

export type Resolved = {
  json:
    | ({
        message: string
      } & Record<string, any>)
    | null
  status: number
}
export class AddSteamAccountController {
  constructor(
    private readonly addSteamAccount: AddSteamAccount,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersDAO: UsersDAO,
    private readonly steamBuilder: SteamBuilder,
    private readonly publisher: Publisher
  ) {}

  async handle(req: HttpClient.Request<IAddSteamAccount>): Promise<HttpClient.Response> {
    const perform = async () => {
      const { accountName, password, userId } = req.payload
      const { username } = (await this.usersDAO.getUsername(userId)) ?? {}
      if (!username) throw new ApplicationError("No user found with this ID.")

      const sac = new SteamAccountClient({
        props: {
          client: this.steamBuilder.create(),
          userId,
          username,
          accountName,
        },
        instances: {
          publisher: this.publisher,
        },
      })

      sac.login(accountName, password)

      try {
        const { status, json } = await Promise.race([
          new Promise<Resolved>((res, rej) => {
            sac.client.on("loggedOn", async () => {
              this.addSteamAccount
                .execute({
                  accountName,
                  password,
                  userId,
                })
                .then(({ steamAccountID }) => {
                  this.allUsersClientsStorage.addSteamAccount(userId, sac)
                  res({
                    json: { message: `${accountName} adicionada com sucesso!`, steamAccountID },
                    status: 201,
                  })
                })
                .catch(rej)
            })
          }),
          new Promise<Resolved>((res, rej) => {
            sac.client.on("steamGuard", (domain, setCode) => {
              sac.setLastHandler(accountName, "steamGuard", setCode)
              res({
                json: { message: `CLX: Sending code to email ${domain}` },
                status: 200,
              })
            })
          }),
          new Promise<Resolved>((res, rej) => {
            sac.client.on("error", error => {
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
