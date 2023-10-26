import SteamUser from "steam-user"
import { Application } from "../application"

export class UserStartFarm {
  constructor(private readonly application: Application) {}

  execute(props: { username: string; password: string; gamesPlayed: number | number[] }) {
    const userClient = new SteamUser()
    this.application.appendUser(props.username, userClient)
    const user = this.application.getUser(props.username)
    if (!user) return console.log("User not found.")
    user.logOn({
      accountName: props.username,
      password: props.password,
    })
    user.on("loggedOn", () => {
      if (user.steamID) console.log(`${user.steamID} has logged on.`)
      console.log(`Playing games: ${props.gamesPlayed}`)
      user.gamesPlayed(props.gamesPlayed)
      console.log(`Setting user to Online`)
      user.setPersona(SteamUser.EPersonaState.Online)
    })
    user.on("error", e => {
      console.log(e)
    })
  }
}
