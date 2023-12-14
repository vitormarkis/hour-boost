import { ApplicationError, SACStateCacheDTO } from "core"
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

  constructor({ instances, props }: SteamAccountClientProps) {
    super()
    this.userId = props.userId
    this.username = props.username
    this.client = props.client
    this.publisher = instances.publisher
    this.emitter = instances.emitter
    this.accountName = props.accountName

    this.client.on("loggedOn", (...args) => {
      console.log("Rodou loggedOn")
      this.getLastHandler("loggedOn")(...args)
      this.setLastArguments("loggedOn", args)
      this.logged = true
      console.log(`${this.username} logged in.`)
      this.client.setPersona(SteamUser.EPersonaState.Online)
      this.client.gamesPlayed([])
    })

    this.client.on("steamGuard", async (...args) => {
      const [domain, callback] = args
      console.log("Rodou steamGuard")
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
      console.log("Rodou error")
      this.emitter.emit("interrupt", SACStateCacheFactory.createDTO(this))
      this.getLastHandler("error")(...args)
      this.setLastArguments("error", args)
      this.logoff()
    })

    this.client.on("disconnected", (...args) => {
      this.logoff()
      this.emitter.emit("interrupt", SACStateCacheFactory.createDTO(this))
      console.log("Rodou disconnected", ...args)
      this.getLastHandler("disconnected")(...args)
      this.setLastArguments("disconnected", args)
    })

    if (process.env.NODE_ENV === "development") {
      console.log("CRIOU HANDLER DO BREAK")
      connection.on("break", () => {
        console.log("break cb: Erro no SAC Client NoConnection")
        this.client.emit("error", { eresult: SteamUser.EResult.NoConnection })
        setTimeout(() => {
          this.client.emit("webSession")
        }, 500)
      })
    }

    this.client.on("webSession", async (...args) => {
      this.emitter.emit("hasSession")
      console.log(`Got a web session for account ${this.accountName}`, ...args)
      console.log("Rodou webSession")
      this.getLastHandler("webSession")(...args)
      this.setLastArguments("webSession", args)
    })

    this.publisher.register({
      operation: "plan-usage-expired-mid-farm",
      notify: async () => {
        console.log("STEAM_CLIENT: Triggering the event.")
        this.farmGames([])
      },
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
    else if (userIntention === "ADD-GAMES") {
      const newGames = gamesID.filter(gid => !this.gamesPlaying.includes(gid))
      this.publisher.publish(new AddMoreGamesCommand({ newGames, when }))
    } else if (userIntention === "REMOVE-GAMES") {
      this.publisher.publish(new PausedSomeGamesCommand({ when }))
    } else if (userIntention === "START-FARMING") {
      this.publisher.publish(new StartFarmingCommand({ when, gamesID }))
    } else if (userIntention === "STOP-FARMING") {
      this.publisher.publish(new StopFarmingCommand({ when }))
    }

    this.setGamesPlaying(gamesID)
    console.log(`STEAM_CLIENT: Calling the client with `, gamesID)
    this.client.gamesPlayed(gamesID)
  }

  isFarming(): boolean {
    return this.gamesPlaying.length > 0
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
