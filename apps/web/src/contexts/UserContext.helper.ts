import { GameSession, Persona, PersonaWithAccountName, UserSession } from "core"
import { IUserMethods } from "./UserContext"

interface IHelper {
  setGames(accountName: string, games: GameSession[]): UserSession
  updatePersona(accountName: string, persona: PersonaWithAccountName): UserSession
  hasGames(): boolean
  farmGames(accountName: string, gamesIdList: number[]): IUserMethods.DataOrError
}

export class Helper implements IHelper {
  constructor(private readonly user: UserSession) {}

  farmGames(accountName: string, gamesIdList: number[]): IUserMethods.DataOrError {
    const maxGamesAllowed = this.user.plan.maxGamesAllowed
    const addAllowedAmountOfGames = gamesIdList.length <= maxGamesAllowed
    if (!addAllowedAmountOfGames)
      return [
        {
          message: `Você só pode farmar ${maxGamesAllowed} jogos por vez.`,
        },
        null,
      ]
    const newUser = this.farmGamesImpl(accountName, gamesIdList)
    return [null, newUser]
  }

  private farmGamesImpl(accountName: string, gamesIdList: number[]): UserSession {
    const steamAccounts = this.user.steamAccounts.map(sa =>
      sa.accountName === accountName
        ? {
            ...sa,
            farmingGames: gamesIdList,
          }
        : sa
    )

    return {
      ...this.user,
      steamAccounts,
    }
  }

  setGames(accountName: string, games: GameSession[]): UserSession {
    const steamAccounts = this.user.steamAccounts.map(sa =>
      sa.accountName === accountName
        ? {
            ...sa,
            games,
          }
        : sa
    )
    return {
      ...this.user,
      steamAccounts,
    }
  }

  updatePersona(accountName: string, persona: Persona): UserSession {
    const steamAccounts = this.user.steamAccounts.map(sa =>
      sa.accountName === accountName
        ? {
            ...sa,
            ...persona,
          }
        : sa
    )

    return {
      ...this.user,
      steamAccounts,
    }
  }

  hasGames(): boolean {
    return this.user.steamAccounts.some(sa => sa.games?.length !== 0)
  }
}
