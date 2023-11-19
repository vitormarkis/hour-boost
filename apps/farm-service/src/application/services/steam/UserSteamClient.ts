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

export class UserSteamClient extends LastHandler {
  private readonly publisher: Publisher
  client: SteamUser
  userId: string
  username: string
  logged: boolean = false
  readonly loginAttempts: Map<string, LoginAttemptsConfig> = new Map()
  gamesPlaying: number[] = []

  constructor({ instances, props }: UserSteamClientProps) {
    super()
    this.userId = props.userId
    this.username = props.username
    this.client = props.client
    this.publisher = instances.publisher
  }

  login(accountName: string, password: string) {
    let { client, setLastHandler } = this

    this.client.logOn({
      accountName,
      password,
    })

    this.client.on("steamGuard", async function (domain, callback) {
      console.log("Steam Guard code needed from email ending in " + domain)
      console.log(`LAST HANDLER! Salvando callback para conta ${accountName}`)
      setLastHandler(accountName, "steamGuard", code => {
        callback(code)
      })
    })

    this.client.on("loggedOn", function (details) {
      console.log("TRIGGERED: loggedOn", details)
      console.log("Logged into Steam as " + client.steamID?.getSteam3RenderedID())
      client.setPersona(SteamUser.EPersonaState.Online)
      client.gamesPlayed([])
    })
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

    this.gamesPlaying = gamesID
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

type UserSteamClientProps = {
  props: {
    userId: string
    username: string
    client: SteamUser
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
