import { AccountGames, AccountSteamGamesList, ApplicationError, DataOrError, SACStateCacheDTO } from "core"
import SteamUser from "steam-user"
import { connection } from "~/__tests__/connection"
import {
  AddMoreGamesCommand,
  PausedSomeGamesCommand,
  StartFarmingCommand,
  StopFarmingCommand,
} from "~/application/commands/steam-client"
import { EventEmitter } from "~/application/services"
import { LastHandler } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { UserSteamGame, UserSteamGamesList } from "~/presentation/presenters"
import { areTwoArraysEqual } from "~/utils"

export class SteamAccountClient extends LastHandler {
  private readonly publisher: Publisher
  readonly emitter: EventEmitter<SteamApplicationEvents>
  client: SteamUser
  userId: string
  username: string
  logged = false
  gamesPlaying: number[] = []
  accountName: string
  ownershipCached = false

  constructor({ instances, props }: SteamAccountClientProps) {
    super()
    this.userId = props.userId
    this.username = props.username
    this.client = props.client
    this.publisher = instances.publisher
    this.emitter = instances.emitter
    this.accountName = props.accountName

    this.client.on("loggedOn", (...args) => {
      console.log("[SAC-CLIENT]: Rodou loggedOn")
      this.emitter.emit("hasSession")
      this.getLastHandler("loggedOn")(...args)
      this.setLastArguments("loggedOn", args)
      this.logged = true
      console.log(`${this.accountName} logged in.`)
      this.client.setPersona(SteamUser.EPersonaState.Online)
      this.client.gamesPlayed([])
    })

    this.client.on("ownershipCached", (...args) => {
      console.log(`ownershipCached - ${this.accountName}`)
      this.ownershipCached = true
      this.getLastHandler("ownershipCached")(...args)
      this.setLastArguments("ownershipCached", args)
    })

    this.client.on("steamGuard", async (...args) => {
      const [domain, callback] = args
      console.log("[SAC-CLIENT]: Rodou steamGuard")
      this.getLastHandler("steamGuard")(...args)
      this.setLastArguments("steamGuard", args)
      this.logoff()
      console.log(
        domain
          ? `${this.username}: Steam Guard code needed from email ending in ${domain}`
          : `${this.username}: requesting Steam Guard on your device.`
      )
      // this.setLastHandler("steamGuard", code => {
      // 	callback(code as string)
      // })
    })

    this.client.on("error", (...args) => {
      console.log("[SAC-CLIENT]: Rodou error")
      // console.log("==============EMITTING INTERRUPT, SHOULD RUN PROMISE.ALL")
      this.emitter.emit("interrupt", SACStateCacheFactory.createDTO(this))
      this.getLastHandler("error")(...args)
      this.setLastArguments("error", args)
      this.logoff()
    })

    this.client.on("disconnected", (...args) => {
      this.logoff()
      this.emitter.emit("interrupt", SACStateCacheFactory.createDTO(this))
      console.log("[SAC-CLIENT]: Rodou disconnected", ...args)
      this.getLastHandler("disconnected")(...args)
      this.setLastArguments("disconnected", args)
    })

    if (process.env.NODE_ENV === "development") {
      connection.on("break", () => {
        console.log(`[SAC Instance] Emitting noConnection error of user ${this.accountName} for the cluster.`)
        this.client.emit("error", { eresult: SteamUser.EResult.NoConnection })
        setTimeout(() => {
          this.client.emit("webSession")
        }, 500).unref()
      })
    }

    this.client.on("webSession", async (...args) => {
      this.emitter.emit("hasSession")
      console.log(`[SAC-CLIENT]: Rodou webSession for ${this.accountName}`)
      this.getLastHandler("webSession")(...args)
      this.setLastArguments("webSession", args)
    })
  }

  getGamesPlaying() {
    return this.gamesPlaying
  }

  stopFarm() {
    this.farmGames([])
  }

  setGamesPlaying(gamesID: number[]) {
    this.gamesPlaying = gamesID
  }

  login(accountName: string, password: string) {
    this.client.logOn({
      accountName,
      password,
    })
  }

  logoff() {
    this.logged = false
  }

  getPlayingGames() {
    return this.gamesPlaying
  }

  farmGames(gamesID: number[]) {
    const when = new Date()

    const userIntention = getUserFarmIntention(gamesID, this.gamesPlaying)
    if (userIntention === "DIDNT-ADD-GAMES") return

    this.setGamesPlaying(gamesID)
    console.log(`STEAM_CLIENT: Calling the client with `, gamesID)
    this.client.gamesPlayed(gamesID)
  }

  isFarming(): boolean {
    return this.gamesPlaying.length > 0
  }

  async getAccountGamesList(): Promise<DataOrError<AccountSteamGamesList>> {
    if (!this.client.steamID) return [new ApplicationError("No steam id set."), null]
    const { apps } = (await this.client.getUserOwnedApps(this.client.steamID)) as unknown as AccountGames
    const games = apps.map(game => new UserSteamGame(game.appid, game.img_icon_url))
    const userSteamGames = new AccountSteamGamesList(games)
    return [null, userSteamGames]
  }
}

function getUserFarmIntention(gamesID: number[], currentFarmingGames: number[]) {
  if (gamesID.length > 0 && currentFarmingGames.length === 0) return "START-FARMING"
  if (gamesID.length === 0) return "STOP-FARMING"
  if (areTwoArraysEqual(gamesID, currentFarmingGames)) return "DIDNT-ADD-GAMES"
  if (gamesID.length === currentFarmingGames.length && !areTwoArraysEqual(gamesID, currentFarmingGames))
    return "ADD-GAMES"
  if (gamesID.length > currentFarmingGames.length) return "ADD-GAMES"
  if (gamesID.length < currentFarmingGames.length) return "REMOVE-GAMES"
  console.log({ gamesID, currentFarmingGames })
  throw new ApplicationError("Server wasn't able to understand user intention.")
}

type SteamAccountClientProps = {
  props: {
    userId: string
    username: string
    client: SteamUser
    accountName: string
  }
  instances: {
    publisher: Publisher
    emitter: EventEmitter<SteamApplicationEvents>
  }
}

type LoginAttemptsConfig = {
  setSteamCodeCallback: (code: string) => void
}

export type OnEventReturn = {
  message: string
  status: number
}

export type SteamApplicationEvents = {
  interrupt: [sacStateCache: SACStateCacheDTO]
  hasSession: []
  "relog-with-state": [sacStateCache: SACStateCacheDTO]
  relog: []
}

export class SACStateCacheFactory {
  static createDTO(sac: SteamAccountClient): SACStateCacheDTO {
    return {
      accountName: sac.accountName,
      gamesPlaying: sac.gamesPlaying,
      isFarming: sac.isFarming(),
    }
  }
}
