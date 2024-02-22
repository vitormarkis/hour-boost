import { SteamAccountClient } from "~/application/services/steam"

export class SACList {
  list: Map<string, SteamAccountClient> = new Map()

  listSACs() {
    return Array.from(this.list.keys())
  }

  has(accountName: string) {
    return this.list.has(accountName)
  }

  set(accountName: string, sac: SteamAccountClient) {
    this.list.set(accountName, sac)
  }

  get(accountName: string) {
    return this.list.get(accountName)
  }

  stopFarmAllAccounts() {
    for (const [_, sac] of this.list) {
      sac.stopFarm()
    }
  }

  delete(accountName: string) {
    this.list.delete(accountName)
  }

  hasAccountsFarming() {
    let isFarmingSACs = false
    for (const [_, sac] of this.list) {
      if (sac.getGamesPlaying().length > 0) {
        isFarmingSACs = true
        break
      }
    }
    return isFarmingSACs
  }
}
