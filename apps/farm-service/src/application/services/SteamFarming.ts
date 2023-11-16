import SteamUser from "steam-user"
import { LoginSessionConfig, LoginSessionID } from "~/presentation/routes"

type UserID = string

export class SteamFarming {
  farmingUsers: Record<UserID, SteamUser> = {}

  constructor(
    private readonly loginSessions: Map<LoginSessionID, LoginSessionConfig>,
    private readonly userLoginSessions: Map<UserID, { loginSessionID: LoginSessionID }>
  ) {}

  addUser(userId: string) {
    this.farmingUsers = {
      ...this.farmingUsers,
      [userId]: new SteamUser(),
    }
  }

  login(userId: UserID, accountName: string, password: string) {
    const user = this.farmingUsers[userId]
    console.log({
      accountName,
      password,
    })
    user.logOn({
      accountName,
      password,
    })
    const { loginSessionID } = this.userLoginSessions.get(userId)!
    const loginSessions = this.loginSessions

    user.on("steamGuard", async function (domain, callback) {
      console.log("TRIGGERED: steamGuard")
      console.log("Steam Guard code needed from email ending in " + domain)
      // var code = getCodeSomehow();
      console.log("Salvando callback ", callback, " no `logginSessions`")
      loginSessions.set(loginSessionID, {
        insertCodeCallback: code => {
          console.log("Rodando callback do steamGuard passando o código " + code)
          callback(code)
        },
      })
    })

    user.on("loggedOn", function (details) {
      console.log("TRIGGERED: loggedOn", details)
      console.log("Logged into Steam as " + user.steamID?.getSteam3RenderedID())
      user.setPersona(SteamUser.EPersonaState.Online)
      user.gamesPlayed([])
    })

    user.on("error", function (e) {
      // Some error occurred during logon
      console.log("TRIGGERED: error")
      console.log(e)
    })

    user.on("webSession", function (sessionID, cookies) {
      console.log("Got web session")
      // Do something with these cookies if you wish
    })

    user.on("newItems", function (count) {
      console.log("TRIGGERED: newItems")
      console.log(count + " new items in our inventory")
    })

    user.on("emailInfo", function (address, validated) {
      console.log("TRIGGERED: emailInfo")
      console.log(
        "Our email address is " + address + " and it's " + (validated ? "validated" : "not validated")
      )
    })

    user.on("wallet", function (hasWallet, currency, balance) {
      console.log("TRIGGERED: wallet")
      console.log("Our wallet balance is " + SteamUser.formatCurrency(balance, currency))
    })

    user.on("accountLimitations", function (limited, communityBanned, locked, canInviteFriends) {
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

    user.on("vacBans", function (numBans, appids) {
      console.log("TRIGGERED: vacBans")
      console.log("We have " + numBans + " VAC ban" + (numBans == 1 ? "" : "s") + ".")
      if (appids.length > 0) {
        console.log("We are VAC banned from apps: " + appids.join(", "))
      }
    })

    user.on("licenses", function (licenses) {
      console.log("TRIGGERED: licenses")
      console.log(
        "Our account owns " + licenses.length + " license" + (licenses.length == 1 ? "" : "s") + "."
      )
    })
  }

  farmGames(userId: string, gamesID: number[]) {
    const user = this.farmingUsers[userId]
    console.log(`Colocando ${userId} para jogar os jogos ${gamesID.map(String).join(", ")}.`)
    user.gamesPlayed(gamesID)
  }

  getSteamClient(userId: string): Record<string, any> | null {
    return this.farmingUsers[userId].accountInfo
  }

  listUsers() {
    return Object.entries(this.farmingUsers).reduce(
      (acc, [key, value]) => {
        const [classWord, instance] = value.constructor.toString().split(" ")
        acc[key] = `${classWord} ${instance}`
        return acc
      },
      {} as Record<string, string>
    )
  }
}
