import { AccountGames } from "core"
import SteamUser, { EResult } from "steam-user"
import { EventEmitter } from "~/application/services"
import { allAccountGames } from "~/consts"
import { playingSession } from "~/infra/services/UserAuthenticationInMemory"
import { relogAttempts } from "~/infra/singletons/relog-attempts"
import { sleep } from "~/utils"

export type EventParameters = {
  loggedOn: [details: Record<string, any>, parental: Record<string, any>]
  steamGuard: [domain: string | null, callback: (code: string) => void, lastCodeWrong: boolean]
  error: [err: Error & { eresult: SteamUser.EResult }]
  disconnected: [eresult: SteamUser.EResult, msg?: string]
  webSession: [sessionID: string, cookies: string[]]
  ownershipCached: []
  refreshToken: [refreshToken: string]
}

export type EventName = keyof EventParameters
export type SteamAccountCredentials = {
  accountName: string
  password: string
}
type LogOnOptionsCredentials = { accountName: string; password: string; authCode?: string }
type LogOnOptionsToken = { refreshToken: string }
const isLogginWithToken = (
  options: LogOnOptionsCredentials | LogOnOptionsToken
): options is LogOnOptionsToken => "refreshToken" in options

export class SteamUserMock extends EventEmitter<EventParameters> {
  steamGuardCode: string | undefined
  logged = false
  isSame = (Math.random() * 1e4).toFixed(0)
  accountName: string | undefined
  private logginAttempts = 0

  constructor(
    private readonly validSteamAccounts: SteamAccountCredentials[],
    private readonly mobile?: boolean
  ) {
    super()
    this.mobile = !!mobile
    this.on("loggedOn", (...args) => {
      console.log("Running event loggedOn")
      this.logged = true
    })
    this.on("error", () => {
      this.logged = false
    })
    this.on("steamGuard", (...args) => {
      this.logged = false
    })
    // connection.on("break", () => {
    //   console.log("Connection break")
    //   this.emit("disconnected", EResult.NoConnection)

    //   setTimeout(() => {
    //     this.emit("webSession", "", [])
    //   }, 500)
    // })
  }

  setSteamGuardCode(code: string) {
    this.steamGuardCode = code
  }

  isMobile() {
    return this.mobile
  }

  logOff() {}

  async logOn(details: LogOnOptionsCredentials | LogOnOptionsToken) {
    if (isLogginWithToken(details)) {
      console.log("[mock-user] loggin with token", details)
      setTimeout(async () => {
        if (details.refreshToken === "INVALID") {
          this.emit("error", Object.assign(new Error(), { eresult: SteamUser.EResult.AccessDenied }))
          return
        }
        this.emit("loggedOn", {}, {})
        // this.emit(
        //   "steamGuard",
        //   this.mobile ? null : "mail.com",
        //   async (code: string) => {
        //     console.log("Dentro do SteamUserMock, settando code.")
        //     this.setSteamGuardCode(code)
        //     await sleep(0.01)
        //     this.emit("loggedOn", {}, {})
        //   },
        //   false
        // )
      }).unref()

      return
    }
    this.logginAttempts++
    let errorCode = 0
    const validAuthCode = details.authCode?.length === 5
    const isValidCredentials = this.validSteamAccounts.some(
      vsa => vsa.accountName === details.accountName && vsa.password === details.password
    )
    console.log("[mock-user] loggin with credentials")
    setTimeout(async () => {
      console.log("ST: loggin")
      if (!isValidCredentials) {
        console.log("is INvalid")
        if (errorCode === SteamUser.EResult.AccountNotFound) console.log(this.validSteamAccounts)
        errorCode = SteamUser.EResult.AccountNotFound
        this.emit("error", {
          ...new Error(),
          eresult: errorCode,
        })
      } else if (this.mobile && !validAuthCode) {
        console.log("Steam guard required.")
        this.emit(
          "steamGuard",
          this.mobile ? null : "mail.com",
          async (code: string) => {
            console.log("Dentro do SteamUserMock, settando code.")
            this.setSteamGuardCode(code)
            await sleep(0.01)
            this.emit("loggedOn", {}, {})
            this.emit("refreshToken", `${details.accountName}-token`)
          },
          false
        )
      } else if (playingSession.includes(details.accountName)) {
        errorCode = SteamUser.EResult.LoggedInElsewhere
        this.emit("error", {
          ...new Error(),
          eresult: errorCode,
        })
      } else {
        if (relogAttempts.isActive && relogAttempts.attempts < 5) {
          relogAttempts.incrementAttempts()
          errorCode = SteamUser.EResult.BadResponse
          this.emit("error", {
            ...new Error(),
            eresult: errorCode,
          })
          return
        }

        console.log("is valid: loggin")
        // await sleep(0.01)
        this.accountName = details.accountName
        this.emit("loggedOn", {}, {})
        this.emit("refreshToken", `${details.accountName}-token`)
        console.log("is valid: loggin")
      }
    }).unref()
  }

  setPersona(persona: string) {}
  gamesPlayed(gamesID: number[]) {}

  async getUserOwnedApps(): Promise<AccountGames> {
    return Promise.resolve(allAccountGames[this.accountName!])
  }

  get steamID() {
    return this.accountName
  }
}
