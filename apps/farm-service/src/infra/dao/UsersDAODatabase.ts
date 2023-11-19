import { PrismaClient } from "@prisma/client"
import { ISteamAccountSession, ISteamGame, PlanUsage, UserSession, UsersDAO } from "core"

import { getCurrentPlanOrCreateOne } from "~/utils"

export class UsersDAODatabase implements UsersDAO {
  constructor(private readonly prisma: PrismaClient) {}

  async getUsername(userId: string): Promise<{ username: string } | null> {
    return (
      this.prisma.user.findUnique({
        where: { id_user: userId },
        select: { username: true },
      }) ?? null
    )
  }

  async getByID(userId: string): Promise<UserSession | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id_user: userId },
      include: {
        plan: { include: { usages: true } },
        purchases: { select: { id_Purchase: true } },
        steamAccounts: { select: { id_steamAccount: true } },
      },
    })

    if (!dbUser) return null

    const userPlan = getCurrentPlanOrCreateOne(dbUser.plan, dbUser.id_user)

    return {
      email: dbUser.email,
      id_user: dbUser.id_user,
      plan:
        userPlan instanceof PlanUsage
          ? {
              autoRestarter: userPlan.autoRestarter,
              maxGamesAllowed: userPlan.maxGamesAllowed,
              maxSteamAccounts: userPlan.maxSteamAccounts,
              maxUsageTime: userPlan.maxUsageTime,
              name: userPlan.name,
              type: userPlan.type as "USAGE",
            }
          : {
              autoRestarter: userPlan.autoRestarter,
              maxGamesAllowed: userPlan.maxGamesAllowed,
              maxSteamAccounts: userPlan.maxSteamAccounts,
              name: userPlan.name,
              type: userPlan.type as "INFINITY",
            },
      profilePic: dbUser.profilePic,
      purchases: dbUser.purchases.map(p => p.id_Purchase),
      role: dbUser.role,
      status: dbUser.status,
      steamAccounts: dbUser.steamAccounts.map(sa => sa.id_steamAccount),
      username: dbUser.username,
    }
  }

  async getUsersSteamAccounts(userId: string): Promise<ISteamAccountSession[]> {
    const userSteamAccountsDatabase = await this.prisma.steamAccount.findMany({
      where: { owner_id: userId },
      select: {
        accountName: true,
        id_steamAccount: true,
        games: true,
      },
    })
    const userSteamAccounts: ISteamAccountSession[] = userSteamAccountsDatabase.map(sa => ({
      accountName: sa.accountName,
      games: sa.games.map(
        g =>
          ({
            gameId: g.gameId,
            id_steamGame: g.id_steamGame,
          }) satisfies ISteamGame
      ),
      id_steamAccount: sa.id_steamAccount,
    }))

    return userSteamAccounts
  }
}
