import { ApplicationError } from "core"
import SteamUser from "steam-user"

export type EventParameters = {
  loggedOn: [details: Record<string, any>, parental: Record<string, any>]
  steamGuard: [domain: string | null, callback: (code: string) => void, lastCodeWrong: boolean]
  error: [err: Error & { eresult: SteamUser.EResult }]
  disconnected: [eresult: SteamUser.EResult, msg?: string]
}

type EventName = keyof EventParameters
type SteamAccountCredentials = {
  accountName: string
  password: string
}

export class SteamUserMock {
  events: Map<EventName, Function[]> = new Map()
  steamGuardCode: string | null = null
  logged = false

  constructor(
    private readonly validSteamAccounts: SteamAccountCredentials[],
    private readonly mobile?: boolean
  ) {
    console.log({
      validSteamAccounts,
    })
    this.mobile = !!mobile
    this.on("loggedOn", () => {
      this.logged = true
    })
    this.on("error", () => {
      this.logged = false
    })
    this.on("steamGuard", () => {
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
      console.log(eventName)
      throw new ApplicationError("Event never registered.")
    }
    eventHandlers.forEach(cb => cb(...payload))
  }

  setSteamGuardCode(code: string) {
    this.steamGuardCode = code
  }

  isMobile() {
    return this.mobile
  }

  logOn(details: { accountName: string; password: string }) {
    let errorCode = 0
    const isValidCredentials = this.validSteamAccounts.some(
      vsa => vsa.accountName === details.accountName && vsa.password === details.password
    )
    console.log("loggin")
    setTimeout(() => {
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
          (code: string) => {
            this.setSteamGuardCode(code)
            this.emit("loggedOn", ...([] as any))
          },
          false
        )
      } else {
        console.log("is valid: loggin")
        this.emit("loggedOn", ...([] as any))
      }
    }).unref()
  }

  setPersona(persona: string) {}
  gamesPlayed(gamesID: number[]) {}
}
