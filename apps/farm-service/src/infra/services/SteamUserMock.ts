import { AccountGames } from "core"
import SteamUser from "steam-user"
import { EventEmitter } from "~/application/services"
import { allAccountGames } from "~/consts"
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

export class SteamUserMock extends EventEmitter<EventParameters> {
  steamGuardCode: string | undefined
  logged = false
  isSame = (Math.random() * 1e4).toFixed(0)
  accountName: string | undefined

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

  async logOn(details: { accountName: string; password: string }) {
    let errorCode = 0
    const isValidCredentials = this.validSteamAccounts.some(
      vsa => vsa.accountName === details.accountName && vsa.password === details.password
    )
    console.log("loggin")
    setTimeout(async () => {
      console.log("ST: loggin")
      if (!isValidCredentials) {
        console.log("is INvalid")
        errorCode = 18
        if (errorCode === 18) console.log(this.validSteamAccounts)
        this.emit("error", {
          ...new Error(),
          eresult: errorCode,
        })
      } else if (this.mobile) {
        console.log("Steam guard required.")
        this.emit(
          "steamGuard",
          this.mobile ? null : "mail.com",
          async (code: string) => {
            console.log("Dentro do SteamUserMock, settando code.")
            this.setSteamGuardCode(code)
            await sleep(0.01)
            this.emit("loggedOn", {}, {})
          },
          false
        )
      } else {
        console.log("is valid: loggin")
        // await sleep(0.01)
        this.accountName = details.accountName
        this.emit("loggedOn", {}, {})
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
