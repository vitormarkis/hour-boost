import { ApplicationError } from "core"
import SteamUser from "steam-user"
import {
  AddMoreGamesCommand,
  PausedSomeGamesCommand,
  StartFarmingCommand,
  StopFarmingCommand,
} from "~/application/commands/steam-client"
import { LastHandler } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { areTwoArraysEqual } from "~/utils"

export class SteamAccountClient extends LastHandler {
  private readonly publisher: Publisher
  client: SteamUser
  userId: string
  username: string
  logged: boolean = false
  readonly loginAttempts: Map<string, LoginAttemptsConfig> = new Map()
  gamesPlaying: number[] = []
  accountName: string

  constructor({ instances, props }: SteamAccountClientProps) {
    super()
    this.userId = props.userId
    this.username = props.username
    this.client = props.client
    this.publisher = instances.publisher
    this.accountName = props.accountName
    this.publisher.register({
      operation: "plan-usage-expired-mid-farm",
      notify: async () => {
        this.farmGames([])
      },
    })
  }

  getGamesPlaying() {
    return this.gamesPlaying
  }

  setGamesPlaying(gamesID: number[]) {
    this.gamesPlaying = gamesID
  }

  login(accountName: string, password: string) {
    this.client.logOn({
      accountName,
      password,
    })

    this.client.on("loggedOn", details => {
      this.logged = true
      console.log(`${this.username} logged in.`)
      this.client.setPersona(SteamUser.EPersonaState.Online)
      this.client.gamesPlayed([])
    })

    this.client.on("steamGuard", async (domain, callback) => {
      console.log(
        domain
          ? `${this.username}: Steam Guard code needed from email ending in ${domain}`
          : `${this.username}: requesting Steam Guard on your device.`
      )
      this.setLastHandler(accountName, "steamGuard", code => {
        callback(code)
      })
    })

    const logoff = () => (this.logged = false)

    this.client.on("error", logoff)
    this.client.on("disconnected", logoff)
    this.client.on("steamGuard", logoff)
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
    this.client.gamesPlayed(gamesID)
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
  }
}

type LoginAttemptsConfig = {
  setSteamCodeCallback: (code: string) => void
}

export type OnEventReturn = {
  message: string
  status: number
}
