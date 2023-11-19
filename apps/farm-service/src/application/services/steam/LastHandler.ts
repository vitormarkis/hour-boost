import { ApplicationError } from "core"

export class LastHandler {
  private readonly lastHandler: Map<string, Map<string, Function>> = new Map()
  getLastHandler = <K extends keyof SteamUserEvents = keyof SteamUserEvents>(
    accountName: string,
    event: K
  ) => {
    const accountNameHandler = this.lastHandler.get(accountName)
    if (!accountNameHandler) throw new ApplicationError("This account don't have the event " + event)
    return accountNameHandler.get(event) as (...args: SteamUserEvents[K]) => void
  }
  setLastHandler = <K extends keyof SteamUserEvents = keyof SteamUserEvents>(
    accountName: string,
    event: K,
    callback: (...args: SteamUserEvents[K]) => void
  ) => {
    const accountNameHandler = this.lastHandler.get(accountName)
    if (!accountNameHandler) return this.lastHandler.set(accountName, new Map().set(event, callback))
    accountNameHandler.set(event, callback)
  }
  listLastHandlers() {
    return this.lastHandler.entries()
  }
}

type SteamUserEvents = {
  loggedOn: []
  steamGuard: [code: string]
  error: []
  disconnected: []
}
