import { GameSession, Persona, PersonaWithAccountName, UserSession } from "core"

interface IHelper {
  setGames(accountName: string, games: GameSession[]): UserSession
  updatePersona(accountName: string, persona: PersonaWithAccountName): UserSession
  hasGames(): boolean
}

export class Helper implements IHelper {
  constructor(private readonly user: UserSession) {}

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
