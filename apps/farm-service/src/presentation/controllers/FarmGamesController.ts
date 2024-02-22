import { ApplicationError, HttpClient, UsersRepository } from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { FarmGamesUseCase } from "~/application/use-cases/FarmGamesUseCase"
import { SingleEventResolver } from "~/types/EventsApp.types"
import { areTwoArraysEqual, makeRes } from "~/utils"
import { LoginSteamWithCredentials } from "~/utils/LoginSteamWithCredentials"
import { GetResult, GetTuple } from "~/utils/helpers"

export namespace FarmGamesHandle {
  export type Payload = {
    accountName: string
    gamesID: number[]
    userId: string
  }

  export type Response = { message: string }
}

abstract class IFarmGamesController {
  abstract handle(...args: any[]): Promise<HttpClient.Response>
}

export class FarmGamesController implements IFarmGamesController {
  private readonly usersRepository: UsersRepository
  private readonly allUsersClientsStorage: AllUsersClientsStorage
  private readonly farmGamesUseCase: FarmGamesUseCase
  private readonly debugger = new ModuleDebugger("FarmGamesController")

  constructor(props: FarmGamesControllerProps) {
    this.usersRepository = props.usersRepository
    this.allUsersClientsStorage = props.allUsersClientsStorage
    this.farmGamesUseCase = props.farmGamesUseCase
  }

  async handle({ payload }: APayload) {
    this.debugger.init()
    const { accountName, gamesID, userId } = payload
    this.debugger.log({ payload })
    const user = await this.usersRepository.getByID(userId)
    this.debugger.log({ user })
    if (!user) {
      this.debugger.commit()
      throw new ApplicationError("Usuário não encontrado.", 404)
    }
    const steamAccountDomain = user.steamAccounts.data.find(sa => sa.credentials.accountName === accountName)
    this.debugger.log({ steamAccountDomain })
    if (!steamAccountDomain) {
      this.debugger.commit()
      throw new ApplicationError("Steam Account nunca foi registrada ou ela não pertence à você.", 400)
    }

    const sac = this.allUsersClientsStorage.getOrAddSteamAccount({
      accountName,
      userId,
      username: user.username,
      planId: user.plan.id_plan,
      autoRestart: steamAccountDomain.autoRelogin,
    })
    this.debugger.log({ sacLogged: sac.logged, sac })
    const sacWasNotFarming = sac.isFarming()
    if (!sac.logged) {
      const loginSteamClientAwaitEvents = new LoginSteamWithCredentials()
      const loginSteamClientResult = await loginSteamClientAwaitEvents.execute({
        sac,
        accountName,
        password: steamAccountDomain.credentials.password,
        trackEvents: {
          loggedOn: true,
          steamGuard: true,
          error: true,
          timeout: true,
        },
      })
      const [errorLoggin] = this.errorWrapperLogingInSAC(loginSteamClientResult, sac)
      this.debugger.log({ errorLoggin })
      if (errorLoggin) {
        this.debugger.commit()
        return errorLoggin
      }
    }
    this.debugger.log({ gamesIDLength: gamesID.length })
    if (gamesID.length === 0) {
      this.debugger.commit()
      throw new ApplicationError("Você não pode farmar 0 jogos, começe o farm a partir de 1.", 403)
    }
    this.debugger.log({
      "gamesID.length > user.plan.maxGamesAllowed": gamesID.length > user.plan.maxGamesAllowed,
    })
    if (gamesID.length > user.plan.maxGamesAllowed) {
      const hasS = user.plan.maxGamesAllowed > 1 ? "s" : ""
      this.debugger.commit()
      throw new ApplicationError(
        `Seu plano não permite o farm de mais do que ${user.plan.maxGamesAllowed} jogo${hasS} por vez.`,
        403
      )
    }
    const noNewGameAddToFarm = areTwoArraysEqual(gamesID, sac.getGamesPlaying())

    this.debugger.log({ noNewGameAddToFarm })
    if (noNewGameAddToFarm) {
      this.debugger.commit()
      return makeRes(200, "Nenhum novo game adicionado ao farm.")
    }

    const [error] = await this.farmGamesUseCase.execute({
      accountName,
      gamesId: gamesID,
      plan: user.plan,
      planId: user.plan.id_plan,
      sac,
      username: user.username,
      session: {
        type: "NEW",
      },
    })
    this.debugger.log({ error })

    if (error) {
      if (error.code === "[FarmUsageService]:PLAN-MAX-USAGE-EXCEEDED") {
        this.debugger.commit()
        return makeRes(403, "Seu plano não possui mais uso disponível.")
      }
      if (error.code === "[FarmInfinityService]:ACCOUNT-ALREADY-FARMING") {
        this.debugger.commit()
        return makeRes(403, "Essa conta já está farmando.")
      }
      this.debugger.commit()
      return {
        json: {
          message: "Aconteceu um erro ao inicar o farm.",
          code: error.code,
        },
        status: error.httpStatus ?? 500,
        // code: error.code,
      }
    }

    this.debugger.commit()
    return makeRes(200, sacWasNotFarming ? "Farm atualizado." : "Iniciando farm.")
  }

  private errorWrapperLogingInSAC(
    [errorExecuting, result]: GetTuple<LoginSteamWithCredentials["execute"]>,
    sac: SteamAccountClient
  ): [HttpClient.Response<any>] | [undefined, GetResult<LoginSteamWithCredentials["execute"]>] {
    if (errorExecuting) {
      if (errorExecuting.payload instanceof SingleEventResolver) {
        if (errorExecuting.payload.type === "steamGuard") {
          const [domain, setCode] = errorExecuting.payload.args
          sac.setManualHandler("steamGuard", code => setCode(code))
          return [
            makeRes(
              202,
              `Steam Guard requerido. Enviando para ${domain ? `e-mail com final ${domain}` : `seu celular.`}`
            ),
          ]
        }

        if (errorExecuting.payload.type === "error") {
          const [error] = errorExecuting.payload.args
          if (error.eresult === SteamUser.EResult.AccountNotFound)
            return [
              makeRes(
                404,
                "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente.",
                error
              ),
            ]
          if (error.eresult === SteamUser.EResult.InvalidPassword) {
            return [makeRes(403, "Conta ou senha incorretas.", error)]
          }
          return [
            makeRes(400, "Aconteceu algum erro no client da Steam.", {
              eresult: error.eresult,
            }),
          ]
        }
      }

      throw new ApplicationError("Algo de inesperado aconteceu.")
    }
    return [undefined, result]
  }
}

type APayload = HttpClient.Request<FarmGamesHandle.Payload>
type AResponse = Promise<HttpClient.Response<FarmGamesHandle.Response>>

type FarmGamesControllerProps = {
  usersRepository: UsersRepository
  allUsersClientsStorage: AllUsersClientsStorage
  farmGamesUseCase: FarmGamesUseCase
}

class ModuleDebugger {
  consoleLog: ((...data: any[]) => void) | undefined = undefined
  constructor(
    public moduleName: string,
    public enabled = false
  ) {}

  init() {
    if (!this.enabled) return
    this.consoleLog = console.log
    console.log = () => {}
    this.consoleLog(`[${this.moduleName}] =====`)
  }

  commit() {
    if (!this.enabled) return
    if (!this.consoleLog) throw new Error("Você esqueceu de dar init no debugger.")
    console.log = this.consoleLog
    this.consoleLog(`[${this.moduleName}] =====`)
    this.consoleLog = undefined
  }

  log(...args: any[]) {
    if (!this.enabled) return
    this.consoleLog!(...args)
  }
}
