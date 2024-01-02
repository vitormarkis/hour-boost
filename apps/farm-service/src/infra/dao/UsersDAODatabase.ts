import { PrismaClient } from "@prisma/client"
import { DatabaseSteamAccount, Persona, PlanUsage, UserSession, UsersDAO } from "core"
import { GetPersonaStateUseCase } from "~/application/use-cases/GetPersonaStateUseCase"

import { getCurrentPlanOrCreateOne } from "~/utils"

export class UsersDAODatabase implements UsersDAO {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly getPersonaStateUseCase: GetPersonaStateUseCase
  ) {}

  async getPlanId(userId: string): Promise<string | null> {
    const foundUser = await this.prisma.user.findUnique({
      where: { id_user: userId },
      select: { plan: true },
    })

    console.log({
      userId,
      foundUser,
      planId: foundUser?.plan?.id_plan ?? "not found",
    })

    return foundUser?.plan?.id_plan ?? null
  }

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
        steamAccounts: {
          select: {
            id_steamAccount: true,
            accountName: true,
          },
        },
      },
    })

    if (!dbUser) return null

    const userPlan = getCurrentPlanOrCreateOne(dbUser.plan, dbUser.id_user)

    const steamAccounts = await Promise.all(
      dbUser.steamAccounts.map(async sa => {
        let persona: Persona
        const [error, foundPersona] = await this.getPersonaStateUseCase.execute({
          accountName: sa.accountName,
          userId: dbUser.id_user,
        })
        persona = error ? getDefaultPersona() : foundPersona
        return {
          accountName: sa.accountName,
          games: null,
          id_steamAccount: sa.id_steamAccount,
          farmingGames: [],
          ...persona,
        }
      })
    )

    return {
      email: dbUser.email,
      id: dbUser.id_user,
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
      steamAccounts,
      username: dbUser.username,
    }
  }

  async getUsersSteamAccounts(userId: string): Promise<DatabaseSteamAccount[]> {
    const userSteamAccountsDatabase = await this.prisma.steamAccount.findMany({
      where: { owner_id: userId },
      select: {
        accountName: true,
        id_steamAccount: true,
      },
    })
    const userSteamAccounts: DatabaseSteamAccount[] = userSteamAccountsDatabase.map(sa => ({
      accountName: sa.accountName,
      id_steamAccount: sa.id_steamAccount,
      userId,
    }))

    return userSteamAccounts
  }
}

function getDefaultPersona(): Persona {
  return {
    profilePictureUrl: null,
  }
}
