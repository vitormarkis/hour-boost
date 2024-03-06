import {
  ApplicationError,
  DataOrFail,
  PlanInfinity,
  PlanUsage,
  SteamAccountClientStateCacheRepository,
} from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { EventParameters } from "~/infra/services"
import { EventParametersTimeout, FarmGamesEventsResolve, SingleEventResolver } from "~/types/EventsApp.types"
import { Logger } from "~/utils/Logger"
import { LoginSteamWithCredentials } from "~/utils/LoginSteamWithCredentials"
import { LoginSteamWithToken } from "~/utils/LoginSteamWithToken"
import { EventPromises } from "~/utils/SteamClientEventsRequired"
import { GetTuple, bad, nice, only } from "~/utils/helpers"

export type RestoreAccountConnectionUseCasePayload = {
  steamAccount: {
    accountName: string
    password: string
    autoRestart: boolean
  }
  user: {
    id: string
    username: string
    plan: PlanInfinity | PlanUsage
  }
}

interface IRestorAccountConnectionUseCase {
  execute(...args: any[]): Promise<DataOrFail<ExecuteError, ExecuteResponse>>
}

export class RestoreAccountConnectionUseCase implements IRestorAccountConnectionUseCase {
  private readonly logger = new Logger("restore-account-connection-use-case")
  private readonly loginSteamWithCredentials = new LoginSteamWithCredentials()
  private readonly loginSteamWithToken = new LoginSteamWithToken()

  constructor(
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async execute({ steamAccount, user }: RestoreAccountConnectionUseCasePayload) {
    const { accountName, password, autoRestart } = steamAccount
    const { id: userId, username, plan } = user
    /**
     * Talvez sac.isRequiringSteamGuard?
     */

    /**
     * REMOVER SAC AO NAO CONSEGUIR RELOGAR
     */

    const trackEvents: Partial<Record<keyof EventPromises, true>> = {
      error: true,
      timeout: true,
      webSession: true,
      loggedOn: true,
    }

    let sac = this.allUsersClientsStorage.getAccountClient(userId, accountName)
    if (sac && sac.logged) {
      this.logger.log(`[${accountName}] sac is logged already`)
      return nice(
        new ClientAppResultWithSAC({
          code: "ACCOUNT-IS-LOGGED-ALREADY",
          fatal: true,
          sac,
        })
      )
    }

    if (!sac) {
      this.logger.log(`[${accountName}] sac wasn't found, adding one`)
      sac = this.allUsersClientsStorage.addSteamAccountFrom0({
        accountName,
        planId: plan.id_plan,
        userId,
        username,
        autoRestart,
      })
    }

    const foundSessionOnCache = await this.steamAccountClientStateCacheRepository.getRefreshToken(accountName)

    if (foundSessionOnCache) {
      this.logger.log(`session found, loggin with token`)
      /**
       * Primeiro logar com refreshToken, se der erro, logar com credenciais
       */

      const [errorLogginWithToken] = await this.loginSteamWithToken.execute({
        sac,
        token: foundSessionOnCache.refreshToken,
        trackEvents,
      })

      if (!errorLogginWithToken) {
        return nice(
          new ClientAppResultWithSAC({
            code: "ACCOUNT-RELOGGED::TOKEN",
            fatal: true,
            sac,
          })
        )
      }
      this.logger.log(`error while loggin with token: [${errorLogginWithToken.code}]`)
    }

    this.logger.log(`session wasn't found or failed, trying with credentials`)
    const loginSteamWithCredentialsResult = await this.loginSteamWithCredentials.execute({
      sac,
      accountName,
      password,
      trackEvents,
    })

    const [errorLogginWithCredentials] = handleLoginSteamWithCredentialsResult(
      loginSteamWithCredentialsResult
    )
    if (errorLogginWithCredentials) {
      this.logger.log(`error while loggin with credentials: [${errorLogginWithCredentials.code}]`)
      return bad(errorLogginWithCredentials)
    }

    if (!sac.logged) throw new Error("tried to return a valid sac, but wasn't logged in")

    return nice(
      new ClientAppResultWithSAC({
        code: "ACCOUNT-RELOGGED::CREDENTIALS",
        fatal: true,
        sac,
      })
    )
  }
}

export class ClientAppResult<const TCode = string, const TFatal = boolean> {
  readonly fatal: TFatal
  readonly code: TCode
  constructor(props: { fatal: TFatal; code: TCode }) {
    this.fatal = props.fatal
    this.code = props.code
  }
}

export class ClientAppResultWithSAC<const TCode = string, const TFatal = boolean> {
  readonly fatal: TFatal
  readonly code: TCode
  readonly sac: SteamAccountClient
  constructor(props: { fatal: TFatal; code: TCode; sac: SteamAccountClient }) {
    this.fatal = props.fatal
    this.code = props.code
    this.sac = props.sac
  }
}

type ExecuteResponse = ClientAppResultWithSAC
type ExecuteError = ClientAppResult | ApplicationError

const handleLoginSteamWithCredentialsResult = (
  loginSteamWithCredentialsResult: GetTuple<LoginSteamWithCredentials["execute"]>
) => {
  const [errorLoggin] = loginSteamWithCredentialsResult
  if (errorLoggin) {
    console.log({errorLoggin})
    if (errorLoggin.payload instanceof SingleEventResolver) {
      const { type } = errorLoggin.payload
      if (type === "steamGuard") {
        return bad(new ClientAppResult({ code: "STEAM-GUARD", fatal: true }))
      }
      const [clientError] = handleSACClientError(errorLoggin.payload)
      if (clientError) return bad(clientError)
    }
    return bad(errorLoggin)
  }
  return nice()
}

const handleSACClientError = (
  props: FarmGamesEventsResolve<EventParameters & EventParametersTimeout> | undefined
) => {
  if (!props) return nice()
  const { args, type } = props

  if (type === "error") {
    const [error] = args ?? []
    if (!error) {
      return bad(new ClientAppResult({ code: "UNKNOWN-CLIENT-ERROR", fatal: true }))
    }
    const steamClientError = handleSteamClientError(error)
    if (steamClientError) return bad(steamClientError)
  }

  if (type === "timeout") {
    return bad(new ClientAppResult({ code: "TIMED-OUT", fatal: false }))
  }

  return nice()
}

export type SACGenericError = Error & {
  eresult: SteamUser.EResult
}

const isNotFatalError = (error: SACGenericError) =>
  error ? [SteamUser.EResult.NoConnection, SteamUser.EResult.ConnectFailed].includes(error.eresult) : false

export function handleSteamClientError(error: SACGenericError) {
  if (error.eresult === SteamUser.EResult.LoggedInElsewhere) {
    return only(new ClientAppResult({ code: "OTHER-SESSION-STILL-ON", fatal: false }))
  }
  if (isNotFatalError(error)) {
    return only(new ClientAppResult({ code: "KNOWN-ERROR", fatal: false }))
  }
  return only(new ClientAppResult({ code: "UNKNOWN-CLIENT-ERROR", fatal: true }))
}

handleSteamClientError satisfies (...args: any[]) => ClientAppResult
