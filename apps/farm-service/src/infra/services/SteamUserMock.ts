import { ApplicationError } from "core"
import SteamUser from "steam-user"
import { LastHandler } from "~/application/services/steam"
import { sleep } from "~/utils"

export type EventParameters = {
  loggedOn: [details: Record<string, any>, parental: Record<string, any>]
  steamGuard: [domain: string | null, callback: (code: string) => void, lastCodeWrong: boolean]
  error: [err: Error & { eresult: SteamUser.EResult }]
  disconnected: [eresult: SteamUser.EResult, msg?: string]
  webSession: [sessionID: string, cookies: string[]]
}

type EventName = keyof EventParameters
type SteamAccountCredentials = {
  accountName: string
  password: string
}

export class SteamUserMock {
  events: Map<EventName, Function[]> = new Map()
  steamGuardCode: string | undefined
  logged = false
  isSame = (Math.random() * 1e4).toFixed(0)

  constructor(
    private readonly validSteamAccounts: SteamAccountCredentials[],
    private readonly mobile?: boolean
  ) {
    console.log({
      validSteamAccounts,
    })
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
  }

  on<T extends keyof EventParameters, A extends EventParameters[T]>(
    eventName: T,
    callback: (...args: A) => void
  ) {
    const eventHandlers = this.events.get(eventName)
    if (!eventHandlers) return this.events.set(eventName, [callback])
    eventHandlers.push(callback)
  }

  emit<T extends keyof EventParameters, A extends EventParameters[T]>(eventName: T, ...payload: A) {
    const eventHandlers = this.events.get(eventName)
    if (!eventHandlers) {
      throw new ApplicationError("Event never registered.", 404, eventName)
    }
    eventHandlers.forEach(cb => cb(...payload))
  }

  setSteamGuardCode(code: string) {
    this.steamGuardCode = code
  }

  isMobile() {
    return this.mobile
  }

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
            this.emit("loggedOn", ...([] as any))
          },
          false
        )
      } else {
        console.log("is valid: loggin")
        // await sleep(0.01)
        this.emit("loggedOn", ...([] as any))
      }
    }).unref()
  }

  setPersona(persona: string) {}
  gamesPlayed(gamesID: number[]) {}
}
