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
import { Prettify, bad, nice } from "~/utils/helpers"

type Payload = {
  accountName: string
  plan: PlanInfinity | PlanUsage
  sac: SteamAccountClient
  username: string
}

interface IRestoreAccountSessionUseCase {
  execute(payload: Payload): Promise<DataOrFail<Fail, any>>
}

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
      return nice(new Fail({ code: EAppResults["SESSION-RESTORED"] }))
    }

    if (errorRestoringOnApplication instanceof ApplicationError) {
      if (errorRestoringOnApplication.code === "PLAN_MAX_USAGE_EXCEEDED") {
        console.log(`[restore-session::${accountName}] uso máximo do plano excedido.`)
      }
      return bad(
        new Fail({
          code: errorRestoringOnApplication.code ?? "UNKNOWN_ERROR",
          payload: errorRestoringOnApplication,
        })
      )
    }

    const [error] = handleSteamClientError(errorRestoringOnApplication)

    if (error) {
      return bad(new Fail({ code: error.code, payload: error }))
    }
    return bad(new Fail({ code: EAppResults["UNKNOWN-CLIENT-ERROR"] }))
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

  console.log("44: ", {
    hasState: !!state,
    isFarming: state?.isFarming,
    shouldRestoreGames,
  })

  if (state) sac.setStatus(state.status)

  if (state && state.isFarming && !shouldRestoreGames) {
    console.log("55: found state, was farming, but since sac.autorestart was off, didn't start farming")
  }
  if (state && state.isFarming && shouldRestoreGames) {
    console.log("44: attempting to restore farm")
    const [errorFarmWithAccount] = await userCluster.farmWithAccount({
      accountName: state.accountName,
      gamesId: state.gamesPlaying,
      planId: state.planId,
      sessionType: EAppResults["CONTINUE-FROM-PREVIOUS"],
    })

    console.log("44:", { errorFarmWithAccount })
    if (errorFarmWithAccount) {
      return bad(errorFarmWithAccount)
    }

    const error = await Promise.race([
      new Promise<SACGenericError>(res => sac.client.once("error", res)),
      new Promise<false>(res => setTimeout(() => res(false), 1000)),
    ])
    if (error) return bad(error)
  }
  return nice()
}

restoreSACSessionOnApplication satisfies (
  ...args: any[]
) => Promise<DataOrFail<SACGenericError | ApplicationError, undefined>>

// new RestoreAccountSessionUseCase().execute().then(res => {
//   const [error, result] = res
//   if(error) return error
// })

const EAppResultsRaw = {
  "SESSION-RESTORED": "SESSION-RESTORED",
  "UNKNOWN-CLIENT-ERROR": "UNKNOWN-CLIENT-ERROR",
  "CONTINUE-FROM-PREVIOUS": "CONTINUE-FROM-PREVIOUS",
  "SAC-NOT-FOUND": "SAC-NOT-FOUND",
  "PLAN-NOT-FOUND": "PLAN-NOT-FOUND",
  "ACCOUNT-ALREADY-FARMING": "ACCOUNT-ALREADY-FARMING",
} as const

export const EAppResults = EAppResultsRaw as Prettify<Mutable<typeof EAppResultsRaw>>
