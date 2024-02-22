import { UserAdminActionBanUserPayload } from "@/components/layouts/pages/admin/BanUser/controller"
import { ToggleAutoReloginPayload } from "@/components/molecules/ToggleAutoRelogin/controller"
import { ECacheKeys } from "@/mutations/queryKeys"
import { QueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { GameSession, Persona, UserSession } from "core"
import { produce } from "immer"
import { getUserActionsMakerWrapper } from "./helpers"

export function createUserActions(queryClient: QueryClient, userId: string) {
  const setUser = getUserActionsMakerWrapper(queryClient, userId)

  const toggleAutoRestart = (accountName: string) => {
    setUser((user: UserSession) => {
      return produce(user, draft => {
        const steamAccount = draft!.steamAccounts.find(sa => sa.accountName === accountName)!
        steamAccount.autoRelogin = !steamAccount.autoRelogin
      })
    })
  }

  const setGames = (accountName: string, games: GameSession[]) => {
    setUser((user: UserSession) => {
      return produce(user, draft => {
        const steamAccount = draft!.steamAccounts.find(sa => sa.accountName === accountName)!
        steamAccount.games = games
      })
    })
  }

  const updatePersona = (accountName: string, persona: Persona) => {
    setUser((user: UserSession) => {
      return produce(user, draft => {
        const steamAccount = draft!.steamAccounts.find(sa => sa.accountName === accountName)!
        Object.assign(steamAccount, persona)
      })
    })
  }

  const startFarm = (accountName: string, when = new Date()) => {
    setUser((user: UserSession) => {
      return produce(user, draft => {
        const steamAccount = draft!.steamAccounts.find(sa => sa.accountName === accountName)!
        steamAccount.farmStartedAt = when.toISOString()
      })
    })
  }

  const updateFarmingGames = ({ accountName, gameIdList }) => {
    setUser((user: UserSession) => {
      return produce(user, draft => {
        const steamAccount = draft!.steamAccounts.find(sa => sa.accountName === accountName)!
        steamAccount.farmingGames = gameIdList
      })
    })
  }

  const hasGames = useSuspenseQuery<UserSession, Error, boolean>({
    queryKey: ECacheKeys.user_session(userId),
    select(user) {
      return user.steamAccounts.some(sa => (sa.games ? sa.games.length > 0 : null))
    },
  }).data

  const isFarming = useSuspenseQuery<UserSession, Error, boolean>({
    queryKey: ECacheKeys.user_session(userId),
    select(user) {
      return user.steamAccounts.some(sa => sa.farmingGames.length > 0)
    },
  }).data

  const hasAccounts = useSuspenseQuery<UserSession, Error, boolean>({
    queryKey: ECacheKeys.user_session(userId),
    select(user) {
      return user.steamAccounts.length > 0
    },
  }).data

  return {
    userId,
    toggleAutoRestart,
    setGames,
    updatePersona,
    hasGames,
    updateFarmingGames,
    isFarming,
    hasAccounts,
    startFarm,
  }
}

export namespace NSUseCache {
  export type BanUser = UserAdminActionBanUserPayload
  export type ToggleAutoRestart = ToggleAutoReloginPayload
}
