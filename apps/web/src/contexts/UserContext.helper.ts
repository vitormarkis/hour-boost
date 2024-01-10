import { GameSession, Persona, PersonaWithAccountName, UserSession } from "core"
import { NSUserContext } from "./UserContext"

interface IHelper {
  setGames(accountName: string, games: GameSession[]): UserSession
  updatePersona(accountName: string, persona: PersonaWithAccountName): UserSession
  hasGames(): boolean
  updateFarmingGames(accountName: string, gameIdList: number[]): UserSession
  udpate(newUser: UserSession): UserSession
}

export class Helper implements IHelper {
  constructor(private readonly user: UserSession) {}

  isFarming() {
    return this.user.steamAccounts.some(sa => sa.farmingGames.length > 0)
  }

  updateFarmingGames(accountName: string, gameIdList: number[]): UserSession {
    const steamAccounts = this.user.steamAccounts.map(sa =>
      sa.accountName === accountName
        ? {
            ...sa,
            farmingGames: gameIdList,
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

  udpate(newUser: UserSession): UserSession {
    return {
      ...this.user,
      ...newUser,
    }
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
