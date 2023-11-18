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
      console.log("TRIGGERED: steamGuard")
      console.log("Steam Guard code needed from email ending in " + domain)

      console.log(`LAST HANDLER! Salvando callback para conta ${accountName}`)
      setLastHandler(accountName, "steamGuard", code => {
        console.log("LAST HANDLER! Rodando callback do steamGuard passando o código " + code)
        callback(code)
      })

      // function setSteamCodeCallback(code: string) {
      //   console.log("Rodando callback do steamGuard passando o código " + code)
      //   callback(code)
      // }
      // loginAttempts.set(accountName, {
      //   setSteamCodeCallback,
      // })
    })

    this.client.on("loggedOn", function (details) {
      console.log("TRIGGERED: loggedOn", details)
      console.log("Logged into Steam as " + client.steamID?.getSteam3RenderedID())
      client.setPersona(SteamUser.EPersonaState.Online)
      client.gamesPlayed([])
    })

    this.client.on("webSession", function (sessionID, cookies) {
      console.log("Got web session")
      // Do something with these cookies if you wish
    })

    this.client.on("newItems", function (count) {
      console.log("TRIGGERED: newItems")
      console.log(count + " new items in our inventory")
    })

    this.client.on("emailInfo", function (address, validated) {
      console.log("TRIGGERED: emailInfo")
      console.log(
        "Our email address is " + address + " and it's " + (validated ? "validated" : "not validated")
      )
    })

    this.client.on("wallet", function (hasWallet, currency, balance) {
      console.log("TRIGGERED: wallet")
      console.log("Our wallet balance is " + SteamUser.formatCurrency(balance, currency))
    })

    this.client.on("accountLimitations", function (limited, communityBanned, locked, canInviteFriends) {
      console.log("TRIGGERED: accountLimitations")
      let limitations = []

      if (limited) {
        limitations.push("LIMITED")
      }

      if (communityBanned) {
        limitations.push("COMMUNITY BANNED")
      }

      if (locked) {
        limitations.push("LOCKED")
      }

      if (limitations.length === 0) {
        console.log("Our account has no limitations.")
      } else {
        console.log("Our account is " + limitations.join(", ") + ".")
      }

      if (canInviteFriends) {
        console.log("Our account can invite friends.")
      }
    })

    this.client.on("vacBans", function (numBans, appids) {
      console.log("TRIGGERED: vacBans")
      console.log("We have " + numBans + " VAC ban" + (numBans == 1 ? "" : "s") + ".")
      if (appids.length > 0) {
        console.log("We are VAC banned from apps: " + appids.join(", "))
      }
    })

    this.client.on("licenses", function (licenses) {
      console.log("TRIGGERED: licenses")
      console.log(
        "Our account owns " + licenses.length + " license" + (licenses.length == 1 ? "" : "s") + "."
      )
    })
  }

  getPlayingGames() {
    return this.gamesPlaying
  }

  farmGames(gamesID: number[]) {
    const when = new Date()

    const userIntention = getUserFarmIntention(gamesID, this.gamesPlaying)
    console.log({ userIntention })
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
  throw new Error("Server wasn't able to understand user intention.")
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
