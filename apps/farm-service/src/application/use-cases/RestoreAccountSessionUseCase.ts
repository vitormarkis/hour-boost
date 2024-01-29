import {
  ApplicationError,
  DataOrFail,
  Fail,
  Mutable,
  PlanInfinity,
  PlanUsage,
  SACStateCacheDTO,
  SteamAccountClientStateCacheRepository,
} from "core"
import { UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { SACGenericError, handleSteamClientError } from "~/application/use-cases"
import { FailGeneric } from "~/types/EventsApp.types"
import { Prettify, bad, nice } from "~/utils/helpers"

type Payload = {
  accountName: string
  plan: PlanInfinity | PlanUsage
  sac: SteamAccountClient
  username: string
}

interface IRestoreAccountSessionUseCase {
  execute(payload: Payload): Promise<DataOrFail<FailGeneric, any>>
}

const moduleName = "[RestoreAccountSessionUseCase]"

/**
 * Já possui SAC ativo, logado ou não, e quer
 * atualizar/restaurar sessão (status, jogos farmando...)
 */
export class RestoreAccountSessionUseCase implements IRestoreAccountSessionUseCase {
  constructor(
    private readonly usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}

  async execute({ accountName, plan, sac, username }: Payload) {
    if (!sac.logged) throw new Error("tried to restore session of an not logged account")

    const state = await this.steamAccountClientStateCacheRepository.get(accountName)
    const [errorRestoringOnApplication] = await restoreSACSessionOnApplication({
      plan,
      sac,
      state,
      username,
      usersClusterStorage: this.usersSACsFarmingClusterStorage,
      shouldRestoreGames: sac.autoRestart,
    })

    if (!errorRestoringOnApplication) {
      return nice({ code: EAppResults["SESSION-RESTORED"] })
    }

    if (errorRestoringOnApplication) {
      if (errorRestoringOnApplication.code === "UNKNOWN-CLIENT-ERROR") {
        const error = handleSteamClientError(errorRestoringOnApplication.payload)
        if (error) {
          return bad(new Fail({ code: error.code, payload: error }))
        }
      }
      if (errorRestoringOnApplication.code === "PLAN_MAX_USAGE_EXCEEDED") {
        console.log(`[${moduleName}::${accountName}] uso máximo do plano excedido.`)
      }
      return bad(
        new Fail({
          code: `${moduleName}::${errorRestoringOnApplication.code ?? "UNKNOWN_ERROR"}`,
          payload: errorRestoringOnApplication,
        })
      )
    }

    return bad(new Fail({ code: EAppResults["UNKNOWN-APPLICATION-ERROR"] }))
  }
}

type Props = {
  sac: SteamAccountClient
  usersClusterStorage: UsersSACsFarmingClusterStorage
  plan: PlanUsage | PlanInfinity
  username: string
  state: SACStateCacheDTO | null
  shouldRestoreGames: boolean
}

export async function restoreSACSessionOnApplication({
  plan,
  sac,
  state,
  username,
  usersClusterStorage,
  shouldRestoreGames,
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

  if (state && state.isFarming && !shouldRestoreGames) {
    console.log("55: found state, was farming, but since sac.autorestart was off, didn't start farming")
  }
  if (state && state.isFarming && shouldRestoreGames) {
    const [errorFarmWithAccount] = await userCluster.farmWithAccount({
      accountName: state.accountName,
      gamesId: state.gamesPlaying,
      planId: state.planId,
      sessionType: EAppResults["CONTINUE-FROM-PREVIOUS"],
    })

    if (errorFarmWithAccount) {
      return bad(
        new Fail({
          code: errorFarmWithAccount.code,
        })
      )
    }

    const error = await Promise.race([
      new Promise<SACGenericError>(res => sac.client.once("error", res)),
      new Promise<false>(res => setTimeout(() => res(false), 1000)),
    ])
    if (error)
      return bad(
        new Fail({
          code: EAppResults["UNKNOWN-CLIENT-ERROR"],
          httpStatus: 400,
          payload: error,
        })
      )
  }
  return nice()
}

restoreSACSessionOnApplication satisfies (...args: any[]) => Promise<DataOrFail<Fail>>

// restoreSACSessionOnApplication().then(res => {
//   const [error] = res

//   if(error?.code === "[RestoreAccountSessionUseCase]::ACCOUNT-ALREADY-FARMING") return
//   if(error?.code === "[RestoreAccountSessionUseCase]::SAC-NOT-FOUND") return
// })

// new RestoreAccountSessionUseCase().execute().then(res => {
//   const [error, result] = res
// })

const EAppResultsRaw = {
  "SESSION-RESTORED": "SESSION-RESTORED",
  "UNKNOWN-CLIENT-ERROR": "UNKNOWN-CLIENT-ERROR",
  "CONTINUE-FROM-PREVIOUS": "CONTINUE-FROM-PREVIOUS",
  "SAC-NOT-FOUND": "SAC-NOT-FOUND",
  "PLAN-NOT-FOUND": "PLAN-NOT-FOUND",
  "ACCOUNT-ALREADY-FARMING": "ACCOUNT-ALREADY-FARMING",
  "PLAN-NOT-FOUND-VIA-USER-ID": "PLAN-NOT-FOUND-VIA-USER-ID",
  "USERNAME-NOT-FOUND-VIA-USER-ID": "USERNAME-NOT-FOUND-VIA-USER-ID",
  "USER-NOT-FOUND": "USER-NOT-FOUND",
  "CLUSTER-NOT-FOUND": "CLUSTER-NOT-FOUND",
  "UNKNOWN-ERROR": "UNKNOWN-ERROR",
  "UNKNOWN-APPLICATION-ERROR": "UNKNOWN-APPLICATION-ERROR",
} as const

export const EAppResults = EAppResultsRaw as Prettify<Mutable<typeof EAppResultsRaw>>
