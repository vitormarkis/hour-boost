import {
  ApplicationError,
  DataOrError,
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
import { SteamClientEventsRequired } from "~/utils/SteamClientEventsRequired"
import { nice, fail, GetTuple } from "~/utils/helpers"
const isNotFatalError = (error: Error & { eresult: SteamUser.EResult }) =>
  error ? [SteamUser.EResult.NoConnection, SteamUser.EResult.ConnectFailed].includes(error.eresult) : false
type Payload = {
  accountName: string
}

export class CronResult<const TCode = string, const TStopCron = boolean> {
  readonly stopCron: TStopCron
  readonly code: TCode
  constructor(props: { stopCron: TStopCron; code: TCode }) {
    this.stopCron = props.stopCron
    this.code = props.code
  }
}
type ExecuteResponse = { stopCron: boolean; code: string }
type ExecuteError = CronResult | ApplicationError

interface IRestoreAccountSessionUseCase {
  execute(payload: Payload): Promise<DataOrFail<ExecuteError, ExecuteResponse>>
}

export class RestoreAccountSessionUseCase implements IRestoreAccountSessionUseCase {
  private readonly loginSteamWithCredentials = new LoginSteamWithCredentials()
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
      return fail(
        new ApplicationError(
          `Nenhuma conta da Steam foi encontrada com o nome [${accountName}].`,
          404,
          undefined,
          "ACCOUNT_NOT_FOUND"
        )
      )
    }

    if (!steamAccount.ownerId) {
      return fail(
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
      return fail(
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

    let sac = this.allUsersClientsStorage.getAccountClient(foundUser.userId, accountName)
    if (sac && sac.logged) {
      return nice({ stopCron: true, code: "ACCOUNT-IS-LOGGED-ALREADY" })
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

      const steamClientEventsRequired = new SteamClientEventsRequired(sac, 10)
      sac.loginWithToken(foundSessionOnCache.refreshToken)
      const sacClientsEvents = await Promise.race(
        steamClientEventsRequired.getEventPromises({
          error: true,
          timeout: true,
          webSession: true,
          loggedOn: true,
        })
      )

      this.logger.log({ loginWithTokenResponseType: sacClientsEvents.type })

      if (["webSession", "loggedOn"].includes(sacClientsEvents.type)) {
        const state = await this.steamAccountClientStateCacheRepository.get(accountName)
        restoreSACSessionOnApplication({
          plan: foundUser.plan,
          sac,
          state,
          username: foundUser.username,
          usersClusterStorage: this.usersSACsFarmingClusterStorage,
        })

        return nice({ stopCron: true, code: "ACCOUNT-RELOGGED::TOKEN" })
      }

      this.logger.log(
        `wasn't able to connect using token for [${accountName}], trying to loggin with credentials`
      )
    }

    const loginSteamWithCredentialsResult = await this.loginSteamWithCredentials.execute({
      sac,
      accountName,
      password: steamAccount.credentials.password,
      trackEvents: {
        loggedOn: true,
        steamGuard: true,
        timeout: true,
        error: true,
      },
    })

    const state = await this.steamAccountClientStateCacheRepository.get(accountName)
    const [errorRestoringSessionAcc] = restoreSessionAcc(loginSteamWithCredentialsResult)

    if (errorRestoringSessionAcc) return fail(errorRestoringSessionAcc)
    restoreSACSessionOnApplication({
      plan: foundUser.plan,
      sac,
      state,
      username: foundUser.username,
      usersClusterStorage: this.usersSACsFarmingClusterStorage,
    })
    console.log("ACCOUNT-RELOGGED: didn't find session, logged with credentials")
    return nice({ stopCron: true, code: "ACCOUNT-RELOGGED::CREDENTIALS" })
  }
}

type Props = {
  sac: SteamAccountClient
  usersClusterStorage: UsersSACsFarmingClusterStorage
  plan: PlanUsage | PlanInfinity
  username: string
  state: SACStateCacheDTO | null
}

export function restoreSACSessionOnApplication({ plan, sac, state, username, usersClusterStorage }: Props) {
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
  }
}

// new RestoreAccountSessionUseCase().execute().then(res => {
//   const [error, result] = res
//   if(error) return error
// })

const restoreSessionAcc = (
  loginSteamWithCredentialsResult: GetTuple<LoginSteamWithCredentials["execute"]>
) => {
  const [errorLoggin] = loginSteamWithCredentialsResult
  if (errorLoggin) {
    const { type } = errorLoggin.payload ?? {}
    if (type === "steamGuard") {
      return fail(new CronResult({ code: "STEAM-GUARD", stopCron: true }))
    }
    const [clientError] = handleSACClientError(errorLoggin.payload)
    if (clientError) return fail(clientError)
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
      return fail(new CronResult({ code: "UNKNOWN-CLIENT-ERROR", stopCron: true }))
    }
    if (error.eresult === SteamUser.EResult.LoggedInElsewhere) {
      return fail(new CronResult({ code: "OTHER-SESSION-STILL-ON", stopCron: false }))
    }
    if (isNotFatalError(error)) {
      return fail(new CronResult({ code: "KNOWN-ERROR", stopCron: false }))
    }
    return fail(new CronResult({ code: "UNKNOWN-CLIENT-ERROR", stopCron: true }))
  }

  if (type === "timeout") {
    return fail(new CronResult({ code: "TIMED-OUT", stopCron: false }))
  }

  return nice()
}
