import { ApplicationError } from "core"

export type EventParameters = {
  loggedOn: []
  error: [
    errorType: {
      eresult: number
    },
  ]
}

type EventName = "loggedOn" | "error"
type SteamAccountCredentials = {
  accountName: string
  password: string
}

export class SteamUserMock {
  constructor(private readonly validSteamAccounts: SteamAccountCredentials[]) {}

  events: Map<EventName, Function[]> = new Map()

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

  logOn(details: { accountName: string; password: string }) {
    const isValidCredentials = this.validSteamAccounts.some(
      vsa => vsa.accountName === details.accountName && vsa.password === details.password
    )
    console.log("loggin")
    setTimeout(() => {
      console.log("ST: loggin")
      if (isValidCredentials) {
        console.log("is valid: loggin")
        this.emit("loggedOn")
      } else {
        console.log("is INvalid")
        this.emit("error", {
          eresult: 18,
        })
      }
    }).unref()
  }

  setPersona(persona: string) {}
  gamesPlayed(gamesID: number[]) {}
}
