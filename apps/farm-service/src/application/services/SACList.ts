import { TsJestCompiler } from "ts-jest"
import { SteamAccountClient } from "~/application/services/steam"

export class SACList {
  list: Map<string, SteamAccountClient> = new Map()

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

  hasAccountsFarming() {
    let isFarmingSACs = false
    for (const [_, sac] of this.list) {
      if (sac.gamesPlaying.length > 0) {
        isFarmingSACs = true
        break
      }
    }
    return isFarmingSACs
  }
}
