import { GameSession, Persona, PersonaWithAccountName, UserSession } from "core"
import { IUserMethods, NSUserContext } from "./UserContext"

interface IHelper {
  setGames(accountName: string, games: GameSession[]): UserSession
  updatePersona(accountName: string, persona: PersonaWithAccountName): UserSession
  hasGames(): boolean
  farmGame(props: IUserMethods.FarmGames): IUserMethods.DataOrError
}

export class Helper implements IHelper {
  constructor(private readonly user: UserSession) {}

  farmGame({ accountName, gameId }: IUserMethods.FarmGames): IUserMethods.DataOrError {
    const maxGamesAllowed = this.user.plan.maxGamesAllowed
    const { farmingGames } = this.user.steamAccounts.find(sa => sa.accountName)!
    const isAdding = !farmingGames.includes(gameId)
    if (isAdding) {
      if (farmingGames.length >= maxGamesAllowed) {
        return [{ message: `Você só pode farmar ${maxGamesAllowed} jogos por vez.` }, null]
      }
      const updatedUser = this.addGameToFarm(accountName, gameId)
      return [null, updatedUser]
    }
    const newUser = this.removeGameFromFarm(accountName, gameId)
    return [null, newUser]
  }

  private addGameToFarm(accountName: string, gameId: number): UserSession {
    const steamAccounts = this.user.steamAccounts.map(sa =>
      sa.accountName === accountName
        ? {
            ...sa,
            farmingGames: [...sa.farmingGames, gameId],
          }
        : sa
    )

    return {
      ...this.user,
      steamAccounts,
    }
  }

  private removeGameFromFarm(accountName: string, gameId: number): UserSession {
    const steamAccounts = this.user.steamAccounts.map(sa =>
      sa.accountName === accountName
        ? {
            ...sa,
            farmingGames: sa.farmingGames.filter(currGame => currGame !== gameId),
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

export function addGameToStageFarmingGames(
  allStageFarmingGames: NSUserContext.StageFarmingGames[],
  accountName: string,
  gameId: number
): NSUserContext.StageFarmingGames[] {
  return allStageFarmingGames.map(stage =>
    stage.accountName === accountName
      ? {
          ...stage,
          stageFarmingGames: [...stage.stageFarmingGames, gameId],
        }
      : stage
  )
}
export function removeGameToStageFarmingGames(
  allStageFarmingGames: NSUserContext.StageFarmingGames[],
  accountName: string,
  gameId: number
): NSUserContext.StageFarmingGames[] {
  return allStageFarmingGames.map(stage =>
    stage.accountName === accountName
      ? {
          ...stage,
          stageFarmingGames: stage.stageFarmingGames.filter(stageGameId => stageGameId !== gameId),
        }
      : stage
  )
}
