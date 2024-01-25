import { PrismaClient } from "@prisma/client"
import {
  DatabaseSteamAccount,
  GameSession,
  Persona,
  PlanInfinity,
  PlanUsage,
  SteamAccountClientStateCacheRepository,
  SteamAccountSession,
  UserSession,
  UsersDAO,
} from "core"
import { PlanBuilder } from "~/application/factories/PlanFactory"
import { GetPersonaStateUseCase } from "~/application/use-cases/GetPersonaStateUseCase"
import { GetUserSteamGamesUseCase } from "~/application/use-cases/GetUserSteamGamesUseCase"

import { getCurrentPlan, getCurrentPlanOrCreateOne } from "~/utils"

export class UsersDAODatabase implements UsersDAO {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly getPersonaStateUseCase: GetPersonaStateUseCase,
    private readonly getUserSteamGamesUseCase: GetUserSteamGamesUseCase,
    private readonly steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository
  ) {}
  async getUserInfoById(
    userId: string
  ): Promise<{ username: string; userId: string; plan: PlanUsage | PlanInfinity } | null> {
    const foundUser = await this.prisma.user.findUnique({
      where: { id_user: userId },
      select: {
        plan: {
          include: {
            usages: true,
          },
        },
        id_user: true,
        username: true,
      },
    })

    return foundUser
      ? {
          plan: getCurrentPlanOrCreateOne(foundUser.plan, foundUser.id_user),
          userId: foundUser.id_user,
          username: foundUser.username,
        }
      : null
  }

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
            autoRelogin: true,
          },
        },
      },
    })

    if (!dbUser) return null

    const userPlan = getCurrentPlanOrCreateOne(dbUser.plan, dbUser.id_user)

    const steamAccounts: SteamAccountSession[] = await Promise.all(
      dbUser.steamAccounts.map(async (sa): Promise<SteamAccountSession> => {
        let games: GameSession[] | null
        let persona: Persona
        const [personaResponse, gamesResponse] = await Promise.all([
          this.getPersonaStateUseCase.execute({
            accountName: sa.accountName,
            userId: dbUser.id_user,
          }),
          this.getUserSteamGamesUseCase.execute({
            accountName: sa.accountName,
            userId: dbUser.id_user,
          }),
        ])
        const [gamesError, foundGames] = gamesResponse
        const [error, foundPersona] = personaResponse
        persona = error ? getDefaultPersona() : foundPersona
        games = gamesError ? null : foundGames.toJSON()
        const accountState = await this.steamAccountClientStateCacheRepository.get(sa.accountName)

        const usages = dbUser.plan
          ? await this.prisma.usage.findMany({
              where: { plan_id: dbUser.plan.id_plan, accountName: sa.accountName },
            })
          : null

        const farmedTimeInSeconds = usages
          ? usages.reduce((acc, item) => {
              return acc + item.amountTime
            }, 0)
          : 0

        console.log("44: usersDAO accountState.status", accountState?.status)

        return Promise.resolve({
          accountName: sa.accountName,
          games,
          id_steamAccount: sa.id_steamAccount,
          farmingGames: accountState?.gamesPlaying ?? [],
          farmedTimeInSeconds,
          farmStartedAt: accountState?.farmStartedAt ? new Date(accountState.farmStartedAt) : null,
          status: accountState?.status ?? "offline",
          autoRelogin: sa.autoRelogin,
          ...persona,
        })
      })
    )

    const farmUsedTime = (
      await this.prisma.usage.aggregate({
        where: { plan_id: dbUser.plan?.id_plan },
        _sum: {
          amountTime: true,
        },
      })
    )._sum.amountTime

    if (farmUsedTime === null) console.log(`Farmed used time voltou como null. [${userId}]`)

    return {
      email: dbUser.email,
      id: dbUser.id_user,
      plan:
        userPlan instanceof PlanUsage
          ? {
              id_plan: userPlan.id_plan,
              autoRestarter: userPlan.autoRestarter,
              maxGamesAllowed: userPlan.maxGamesAllowed,
              maxSteamAccounts: userPlan.maxSteamAccounts,
              maxUsageTime: userPlan.maxUsageTime,
              name: userPlan.name,
              type: userPlan.type as "USAGE",
              farmUsedTime: farmUsedTime ?? 0,
            }
          : {
              id_plan: userPlan.id_plan,
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
