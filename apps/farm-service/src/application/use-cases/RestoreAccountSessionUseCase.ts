import {
  ApplicationError,
  DataOrFail,
  PlanInfinity,
  PlanUsage,
  SACStateCacheDTO,
  SteamAccountClientStateCacheRepository,
  SteamAccountsRepository,
  UsersDAO,
} from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { EventParameters } from "~/infra/services"
import { EventParametersTimeout, FarmGamesEventsResolve } from "~/types/EventsApp.types"
import { Logger } from "~/utils/Logger"
import { LoginSteamWithCredentials } from "~/utils/LoginSteamWithCredentials"
import { LoginSteamWithToken } from "~/utils/LoginSteamWithToken"
import { EventPromises } from "~/utils/SteamClientEventsRequired"
import { GetTuple, bad, nice } from "~/utils/helpers"

const isNotFatalError = (error: Error & { eresult: SteamUser.EResult }) =>
  error ? [SteamUser.EResult.NoConnection, SteamUser.EResult.ConnectFailed].includes(error.eresult) : false

type Payload = {
  accountName: string
}

export class ClientAppResult<const TCode = string, const TFatal = boolean> {
  readonly fatal: TFatal
  readonly code: TCode
  constructor(props: { fatal: TFatal; code: TCode }) {
    this.fatal = props.fatal
    this.code = props.code
  }
}
type ExecuteResponse = ClientAppResult
type ExecuteError = ClientAppResult | ApplicationError

interface IRestoreAccountSessionUseCase {
  execute(payload: Payload): Promise<DataOrFail<ExecuteError, ExecuteResponse>>
}

export class RestoreAccountSessionUseCase implements IRestoreAccountSessionUseCase {
  private readonly loginSteamWithCredentials = new LoginSteamWithCredentials()
  private readonly loginSteamWithToken = new LoginSteamWithToken()
  private readonly logger = new Logger("restore-account-session-use-case")

  constructor(
    private readonly steamAccountsRepository: SteamAccountsRepository,
    private readonly allUsersClientsStorage: AllUsersClientsStorage,
    private readonly usersDAO: UsersDAO,
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async execute({ accountName }: Payload) {
    const steamAccount = await this.steamAccountsRepository.getByAccountName(accountName)

    if (!steamAccount) {
      return bad(
        new ApplicationError(
          `Nenhuma conta da Steam foi encontrada com o nome [${accountName}].`,
          404,
          undefined,
          "ACCOUNT_NOT_FOUND"
        )
      )
    }

    if (!steamAccount.ownerId) {
      return bad(
        new ApplicationError(
          "Essa conta não está vinculada a nenhum usuário.",
          undefined,
          undefined,
          "ACCOUNT_NOT_ASSIGNED_TO_ANYONE"
        )
      )
    }

    const foundUser = await this.usersDAO.getUserInfoById(steamAccount.ownerId)

    if (!foundUser) {
      return bad(
        new ApplicationError(
          `Usuário com id [${steamAccount.ownerId}] não foi encontrado.`,
          404,
          undefined,
          "USER_NOT_FOUND"
        )
      )
    }

    /**
     * Talvez sac.isRequiringSteamGuard?
     */

    const trackEvents: Partial<Record<keyof EventPromises, true>> = {
      error: true,
      timeout: true,
      webSession: true,
      loggedOn: true,
    }

    let sac = this.allUsersClientsStorage.getAccountClient(foundUser.userId, accountName)
    if (sac && sac.logged) {
      return nice({ fatal: true, code: "ACCOUNT-IS-LOGGED-ALREADY" } satisfies ExecuteResponse)
    }

    if (!sac) {
      sac = this.allUsersClientsStorage.addSteamAccountFrom0({
        accountName,
        planId: foundUser.plan.id_plan,
        userId: foundUser.userId,
        username: foundUser.username,
      })
    }

    const foundSessionOnCache = await this.steamAccountClientStateCacheRepository.getRefreshToken(accountName)

    if (foundSessionOnCache) {
      /**
       * Primeiro logar com refreshToken, se der erro, logar com credenciais
       */

      const [errorLogginWithToken] = await this.loginSteamWithToken.execute({
        sac,
        token: foundSessionOnCache.refreshToken,
        trackEvents,
      })

      if (!errorLogginWithToken) {
        const state = await this.steamAccountClientStateCacheRepository.get(accountName)
        const [errorRestoringOnApplication] = await restoreSACSessionOnApplication({
          plan: foundUser.plan,
          sac,
          state,
          username: foundUser.username,
          usersClusterStorage: this.usersSACsFarmingClusterStorage,
        })
        if (errorRestoringOnApplication) {
          const [error] = handleSteamClientError(errorRestoringOnApplication)
          if (error) return bad(error)
        }

        return nice({ fatal: true, code: "ACCOUNT-RELOGGED::TOKEN" } satisfies ExecuteResponse)
      }
    }

    const loginSteamWithCredentialsResult = await this.loginSteamWithCredentials.execute({
      sac,
      accountName,
      password: steamAccount.credentials.password,
      trackEvents,
    })

    const state = await this.steamAccountClientStateCacheRepository.get(accountName)
    const [errorLogginWithCredentials] = handleLoginSteamWithCredentialsResult(
      loginSteamWithCredentialsResult
    )

    if (errorLogginWithCredentials) return bad(errorLogginWithCredentials)
    const [errorRestoringOnApplication] = await restoreSACSessionOnApplication({
      plan: foundUser.plan,
      sac,
      state,
      username: foundUser.username,
      usersClusterStorage: this.usersSACsFarmingClusterStorage,
    })
    if (errorRestoringOnApplication) {
      const [error] = handleSteamClientError(errorRestoringOnApplication)
      if (error) return bad(error)
    }
    console.log("ACCOUNT-RELOGGED: didn't find session, logged with credentials")
    return nice({ fatal: true, code: "ACCOUNT-RELOGGED::CREDENTIALS" } satisfies ExecuteResponse)
  }
}

type Props = {
  sac: SteamAccountClient
  usersClusterStorage: UsersSACsFarmingClusterStorage
  plan: PlanUsage | PlanInfinity
  username: string
  state: SACStateCacheDTO | null
}

export async function restoreSACSessionOnApplication({
  plan,
  sac,
  state,
  username,
  usersClusterStorage,
}: Props) {
  const userCluster = usersClusterStorage.getOrAdd(username, plan)
  const isAccountFarming = userCluster.isAccountFarming(sac.accountName)
  if (!userCluster.hasSteamAccountClient(sac.accountName) && !isAccountFarming) {
    const [errorAddingSac] = userCluster.addSAC(sac)
    if (errorAddingSac?.code === "TRIED_TO_ADD::ALREADY_EXISTS") {
      console.log({ errorAddingSac })
    }
  }

  if (state) sac.setStatus(state.status)

  if (state && state.isFarming) {
    userCluster.farmWithAccount({
      accountName: state.accountName,
      gamesId: state.gamesPlaying,
      planId: state.planId,
      sessionType: "CONTINUE-FROM-PREVIOUS",
    })

    const error = await Promise.race([
      new Promise<SACGenericError>(res => sac.client.once("error", res)),
      new Promise<false>(res => setTimeout(() => res(false), 1000)),
    ])
    if (error) return bad(error)
  }
  return nice()
}

restoreSACSessionOnApplication satisfies (...args: any[]) => Promise<DataOrFail<SACGenericError, undefined>>

type SACGenericError = Error & {
  eresult: SteamUser.EResult
}

// new RestoreAccountSessionUseCase().execute().then(res => {
//   const [error, result] = res
//   if(error) return error
// })

const handleLoginSteamWithCredentialsResult = (
  loginSteamWithCredentialsResult: GetTuple<LoginSteamWithCredentials["execute"]>
) => {
  const [errorLoggin] = loginSteamWithCredentialsResult
  if (errorLoggin) {
    const { type } = errorLoggin.payload ?? {}
    if (type === "steamGuard") {
      return bad(new ClientAppResult({ code: "STEAM-GUARD", fatal: true } satisfies ExecuteResponse))
    }
    const [clientError] = handleSACClientError(errorLoggin.payload)
    if (clientError) return bad(clientError)
  }
  return nice(undefined)
}

const handleSACClientError = (
  props: FarmGamesEventsResolve<EventParameters & EventParametersTimeout> | undefined
) => {
  if (!props) return nice()
  const { args, type } = props

  if (type === "error") {
    const [error] = args ?? []
    if (!error) {
      return bad(new ClientAppResult({ code: "UNKNOWN-CLIENT-ERROR", fatal: true } satisfies ExecuteResponse))
    }
    const [steamClientError] = handleSteamClientError(error)
    if (steamClientError) return bad(steamClientError)
  }

  if (type === "timeout") {
    return bad(new ClientAppResult({ code: "TIMED-OUT", fatal: false } satisfies ExecuteResponse))
  }

  return nice()
}

function handleSteamClientError(error: SACGenericError) {
  if (error.eresult === SteamUser.EResult.LoggedInElsewhere) {
    return bad(
      new ClientAppResult({ code: "OTHER-SESSION-STILL-ON", fatal: false } satisfies ExecuteResponse)
    )
  }
  if (isNotFatalError(error)) {
    return bad(new ClientAppResult({ code: "KNOWN-ERROR", fatal: false } satisfies ExecuteResponse))
  }
  return bad(new ClientAppResult({ code: "UNKNOWN-CLIENT-ERROR", fatal: true } satisfies ExecuteResponse))
}

handleSteamClientError satisfies (...args: any[]) => DataOrFail<ClientAppResult>
