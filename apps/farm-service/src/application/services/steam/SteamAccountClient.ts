import {
  AccountGames,
  AccountSteamGamesList,
  ApplicationError,
  DataOrError,
  GameSession,
  IRefreshToken,
  SACStateCacheDTO,
  SteamAccountPersonaState,
} from "core"
import { appendFile } from "fs"
import SteamUser from "steam-user"
import { connection } from "~/__tests__/connection"
import { EventEmitter } from "~/application/services"
import { LastHandler } from "~/application/services/steam"
import { getHeaderImageByGameId } from "~/consts"
import { Publisher } from "~/infra/queue"
import { areTwoArraysEqual } from "~/utils"
import { Logger } from "~/utils/Logger"

export class SteamAccountClient extends LastHandler {
  private readonly publisher: Publisher
  readonly logger: Logger
  readonly emitter: EventEmitter<SteamApplicationEvents>
  client: SteamUser
  userId: string
  username: string
  planId: string
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
    this.planId = props.planId
    this.emitter = instances.emitter
    this.accountName = props.accountName
    this.logger = new Logger(this.accountName)

    this.client.on("loggedOn", (...args) => {
      this.emitter.emit("hasSession")
      this.getLastHandler("loggedOn")(...args)
      this.setLastArguments("loggedOn", args)
      this.logged = true
      this.logger.log("logged in.")
      this.client.setPersona(SteamUser.EPersonaState.Online)
      this.client.gamesPlayed([])
    })

    this.client.on("ownershipCached", (...args) => {
      this.logger.log(`ownershipCached!`)
      this.ownershipCached = true
      this.getLastHandler("ownershipCached")(...args)
      this.setLastArguments("ownershipCached", args)
    })

    // @ts-ignore
    this.client.on("refreshToken", async (...args: [refreshToken: string]) => {
      const [refreshToken] = args
      this.emitter.emit("gotRefreshToken", {
        refreshToken,
        userId: this.userId,
        username: this.username,
        accountName: this.accountName,
        planId: this.planId,
      })
      this.logger.log(`got refreshToken.`)
      this.getLastHandler("refreshToken")(...args)
      this.setLastArguments("refreshToken", args)
    })

    this.client.on("steamGuard", async (...args) => {
      const [domain] = args
      this.logger.log("steam guard required.")
      this.getLastHandler("steamGuard")(...args)
      this.setLastArguments("steamGuard", args)
      this.changeInnerStatusToNotLogged()
      this.logger.log(
        domain
          ? `Steam Guard code needed from email ending in ${domain}`
          : `requesting Steam Guard on your device.`
      )
    })

    this.client.on("error", (...args) => {
      this.changeInnerStatusToNotLogged()
      appendFile(
        "logs/sac-errors.txt",
        `${new Date().toISOString()} [${this.accountName}] - ${JSON.stringify(...args)} \r\n`,
        () => {}
      )
      this.logger.log("error.", { eresult: args[0].eresult })
      this.emitter.emit("interrupt", this.createStateDTO())
      this.getLastHandler("error")(...args)
      this.setLastArguments("error", args)
    })

    this.client.on("disconnected", (...args) => {
      appendFile(
        "logs/sac-disconnected.txt",
        `${new Date().toISOString()} [${this.accountName}] - ${JSON.stringify(args)} \r\n`,
        () => {}
      )
      this.changeInnerStatusToNotLogged()
      this.emitter.emit("interrupt", this.createStateDTO())
      this.logger.log("disconnected.", ...args)
      this.getLastHandler("disconnected")(...args)
      this.setLastArguments("disconnected", args)
    })

    if (process.env.NODE_ENV === "development") {
      connection.on("break", () => {
        this.logger.log(`Emitting noConnection error of user ${this.accountName} for the cluster.`)
        this.client.emit("error", { eresult: SteamUser.EResult.NoConnection })
        setTimeout(() => {
          this.client.emit("webSession")
        }, 500).unref()
      })
    }

    this.client.on("webSession", async (...args) => {
      this.emitter.emit("hasSession")
      this.logger.log(`Got webSession.`)
      this.getLastHandler("webSession")(...args)
      this.setLastArguments("webSession", args)
    })
  }

  private createStateDTO(): NSSACStateCacheFactory.CreateDTO_SAC_Props {
    return {
      accountName: this.accountName,
      gamesPlaying: this.gamesPlaying,
      isFarming: this.isFarming(),
      planId: this.planId,
      username: this.username,
    }
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

  login(accountName: string, password: string, authCode?: string) {
    this.client.logOn({
      accountName,
      password,
      authCode,
    })
  }

  changeInnerStatusToNotLogged() {
    this.logged = false
  }

  logoff() {
    this.logger.log(`${this.accountName} logged off.`)
    this.emitter.emit("user-logged-off")
    this.client.logOff()
  }

  getPlayingGames() {
    return this.gamesPlaying
  }

  farmGames(gamesID: number[]) {
    const when = new Date()

    const userIntention = getUserFarmIntention(gamesID, this.gamesPlaying)
    if (userIntention === "DIDNT-ADD-GAMES") return

    this.setGamesPlaying(gamesID)
    this.logger.log(`Calling the client with `, gamesID)
    this.client.gamesPlayed(gamesID)
  }

  isFarming(): boolean {
    return this.gamesPlaying.length > 0
  }

  async getAccountGamesList(): Promise<DataOrError<AccountSteamGamesList>> {
    if (!this.client.steamID) return [new ApplicationError("No steam id set.")]
    const { apps } = (await this.client.getUserOwnedApps(this.client.steamID)) as unknown as AccountGames
    const games: GameSession[] = apps.map(game => ({
      id: game.appid,
      imageUrl: getHeaderImageByGameId(game.appid),
      name: game.name ?? "unnamed game",
    }))
    const userSteamGames = new AccountSteamGamesList(games)
    return [null, userSteamGames]
  }

  async getAccountPersona(): Promise<DataOrError<SteamAccountPersonaState>> {
    const steamId = this.client.steamID?.toString()
    if (!steamId)
      return Promise.reject([new ApplicationError(`${this.accountName}: No steam id found.`), null])
    const persona: Record<string, any> = await new Promise((resolve, reject) => {
      this.client.getPersonas([steamId], (error, personas) => {
        if (error) reject(error)
        resolve(personas[steamId])
      })
    })

    const personaState: SteamAccountPersonaState = {
      accountName: this.accountName,
      profilePictureUrl: persona["avatar_url_medium"],
    }

    return Promise.resolve([null, personaState])
  }

  loginWithToken(refreshToken: string) {
    this.client.logOn({
      refreshToken,
    })
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
    planId: string
  }
  instances: {
    publisher: Publisher
    emitter: EventEmitter<SteamApplicationEvents>
  }
}

export type OnEventReturn = {
  message: string
  status: number
}

export type SteamApplicationEvents = {
  interrupt: [createCacheStateDTO: NSSACStateCacheFactory.CreateDTO_SAC_Props]
  hasSession: []
  "relog-with-state": [sacStateCache: SACStateCacheDTO]
  relog: []
  gotRefreshToken: [refreshTokenInterface: IRefreshToken & { accountName: string }]
  "user-logged-off": []
}

export class SACStateCacheFactory {
  static createDTO(props: NSSACStateCacheFactory.CreateDTOProps): SACStateCacheDTO {
    return {
      accountName: props.accountName,
      gamesPlaying: props.gamesPlaying,
      isFarming: props.isFarming,
      planId: props.planId,
      username: props.username,
      farmStartedAt: props.farmStartedAt?.getTime() ?? null,
    }
  }
}

export namespace NSSACStateCacheFactory {
  export type CreateDTO_SAC_Props = {
    accountName: string
    gamesPlaying: number[]
    isFarming: boolean
    planId: string
    username: string
  }

  export type CreateDTOClusterProps = {
    farmStartedAt: Date | null
  }

  export type CreateDTOProps = CreateDTO_SAC_Props & CreateDTOClusterProps
}
