import { UserMethods } from "@/contexts/UserContext"
import { GameWithAccountName, UserSession } from "core"

export class Helper implements UserMethods {
  constructor(private readonly user: UserSession) {}

  appendGames(games: GameWithAccountName[]) {
    const steamAccounts = this.user.steamAccounts.map(sa => {
      const foundGames = games.find(g => g.accountName === sa.accountName)
      return {
        ...sa,
        games: foundGames?.games ?? [],
      }
    })
    return {
      ...this.user,
      steamAccounts,
    }
  }
}
