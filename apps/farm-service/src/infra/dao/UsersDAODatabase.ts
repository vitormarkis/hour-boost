import { PrismaClient } from "@prisma/client"
import {
  DatabaseSteamAccount,
  GameSession,
  Persona,
  PlanInfinity,
  PlanUsage,
  SteamAccountClientStateCacheRepository,
  UserAdminPanelSession,
  SteamAccountSession,
  Usage,
  UserSession,
  UsersDAO,
  PurchaseSession,
  UserSessionShallow,
} from "core"
import { AllUsersClientsStorage, UsersSACsFarmingClusterStorage } from "~/application/services"
import { GetPersonaStateUseCase } from "~/application/use-cases/GetPersonaStateUseCase"
import { GetUserSteamGamesUseCase } from "~/application/use-cases/GetUserSteamGamesUseCase"

import { getCurrentPlanOrCreateOne } from "~/utils"

export class UsersDAODatabase implements UsersDAO {
  steamAccountFromDatabaseToSession: SteamAccountFromDatabaseToSession

  constructor(
    private readonly prisma: PrismaClient,
    getPersonaStateUseCase: GetPersonaStateUseCase,
    getUserSteamGamesUseCase: GetUserSteamGamesUseCase,
    steamAccountClientStateCacheRepository: SteamAccountClientStateCacheRepository,
    usersSACsFarmingClusterStorage: UsersSACsFarmingClusterStorage,
    allUsersClientsStorage: AllUsersClientsStorage
  ) {
    this.steamAccountFromDatabaseToSession = makeSteamAccountFromDatabaseToSession(
      getPersonaStateUseCase,
      getUserSteamGamesUseCase,
      allUsersClientsStorage
    )
  }
  async getByIDShallow(userId: string): Promise<UserSessionShallow | null> {
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
            usage: true,
          },
        },
      },
    })

    if (!dbUser) return null

    const farmUsedTime = await getFarmUsedTime(dbUser.plan?.usages ?? null)
    const userPlan = getCurrentPlanOrCreateOne(dbUser.plan, dbUser.id_user)

    const result: UserSessionShallow = {
      email: dbUser.email,
      id: dbUser.id_user,
      plan: userPlanToPlanSession(userPlan, farmUsedTime),
      profilePic: dbUser.profilePic,
      role: dbUser.role,
      status: dbUser.status,
      username: dbUser.username,
    }
    return result
  }

  async getUsersAdminList(): Promise<UserAdminPanelSession[]> {
    const usersAdminListDatabase = await getUserAdminListDatabase(this.prisma)

    const finalResultPromises = usersAdminListDatabase.map(async user => {
      const userPlan = getCurrentPlanOrCreateOne(user.plan!, user.id_user)

      const farmUsedTime = await getFarmUsedTime(user.plan?.usages ?? null)

      const steamAccounts = await Promise.all(
        user.steamAccounts.map(async sa => {
          return this.steamAccountFromDatabaseToSession(
            {
              accountName: sa.accountName,
              id_steamAccount: sa.id_steamAccount,
            },
            {
              id_user: user.id_user,
              id_plan: user.plan!.id_plan,
              username: user.username,
              plan: { usages: user.plan?.usages ?? null },
            }
          )
        })
      )

      const result: UserAdminPanelSession = {
        id_user: user.id_user,
        username: user.username,
        plan: userPlanToPlanSession(userPlan, farmUsedTime),
        profilePicture: user.profilePic,
        purchases: user.purchases.map(map_purchasesFromDatabaseToSession),
        role: user.role,
        status: user.status,
        steamAccounts,
      }

      return result
    })

    return Promise.all(finalResultPromises)
  }

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
            usage: true,
          },
        },
      },
    })

    if (!dbUser) return null

    const userPlan = getCurrentPlanOrCreateOne(dbUser.plan, dbUser.id_user)

    const steamAccounts: SteamAccountSession[] = await Promise.all(
      dbUser.steamAccounts.map(async sa => {
        return this.steamAccountFromDatabaseToSession(
          {
            accountName: sa.accountName,
            id_steamAccount: sa.id_steamAccount,
          },
          {
            id_user: userId,
            id_plan: dbUser.plan!.id_plan,
            username: dbUser.username,
            plan: { usages: dbUser.plan?.usages ?? null },
          }
        )
      })
    )

    const farmUsedTime = await getFarmUsedTime(dbUser.plan?.usages ?? null)
    if (farmUsedTime === null) console.log(`Farmed used time voltou como null. [${userId}]`)

    return {
      email: dbUser.email,
      id: dbUser.id_user,
      plan: userPlanToPlanSession(userPlan, farmUsedTime),
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

function userPlanToPlanSession(userPlan: PlanUsage | PlanInfinity, farmUsedTime: number | null) {
  return userPlan instanceof PlanUsage
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
      }
}

type DBSteamAccount = {
  accountName: string
  id_steamAccount: string
}

type DBUser = {
  id_plan: string
  id_user: string
  username: string
  plan: {
    usages: Usage[] | null
  }
}

function makeSteamAccountFromDatabaseToSession(
  getPersonaStateUseCase: GetPersonaStateUseCase,
  getUserSteamGamesUseCase: GetUserSteamGamesUseCase,
  allUsersClientsStorage: AllUsersClientsStorage
) {
  return async function (sa: DBSteamAccount, dbUser: DBUser): Promise<SteamAccountSession> {
    let games: GameSession[] | null
    let persona: Persona
    const [personaResponse, gamesResponse] = await Promise.all([
      getPersonaStateUseCase.execute({
        accountName: sa.accountName,
        userId: dbUser.id_user,
      }),
      getUserSteamGamesUseCase.execute({
        accountName: sa.accountName,
        userId: dbUser.id_user,
      }),
    ])
    const [gamesError, foundGames] = gamesResponse
    const [error, foundPersona] = personaResponse
    persona = error ? getDefaultPersona() : foundPersona
    games = gamesError ? null : foundGames.toJSON()
    // const [errorGettingCluster, cluster] = usersSACsFarmingClusterStorage.get(dbUser.username)
    // if (errorGettingCluster) {
    //   console.log(errorGettingCluster)
    //   throw errorGettingCluster
    // }
    // const { farmStartedAt } = cluster.getInnerState()

    const sac = allUsersClientsStorage.getAccountClient(dbUser.id_user, sa.accountName)
    if (!sac)
      throw new Error(
        `Sac not found for user ${sa.accountName}, but has users: [${allUsersClientsStorage.listUsersKeys()}]`
      )
    const cacheStateDTO = sac.getCache().toDTO()
    const { accountName, gamesPlaying, gamesStaging, status } = cacheStateDTO
    const farmStartedAt = cacheStateDTO.farmStartedAt
      ? new Date(cacheStateDTO.farmStartedAt).toISOString()
      : null

    const farmedTimeInSeconds = dbUser.plan.usages
      ? dbUser.plan.usages.reduce((acc, item) => {
          if (item.accountName === sa.accountName) return acc + item.amountTime
          return acc
        }, 0)
      : 0

    if (status === "iddle") throw new Error("SAC state status iddle being sent to the client")

    return Promise.resolve({
      accountName,
      games,
      id_steamAccount: sa.id_steamAccount,
      farmingGames: gamesPlaying,
      stagingGames: gamesStaging,
      farmedTimeInSeconds,
      farmStartedAt,
      status,
      autoRelogin: sac.autoRestart ?? false,
      ...persona,
    })
  }
}

type SteamAccountFromDatabaseToSession = ReturnType<typeof makeSteamAccountFromDatabaseToSession>

function getDefaultPersona(): Persona {
  return {
    profilePictureUrl: null,
  }
}

async function getFarmUsedTime(usages: Usage[] | null) {
  return usages
    ? usages.reduce((acc, item) => {
        return acc + item.amountTime
      }, 0)
    : 0
}

function map_purchasesFromDatabaseToSession(purchaseDB: UserAdminListDatabasePurchase): PurchaseSession {
  return {
    id_Purchase: purchaseDB.id_Purchase,
    type: {
      from: { planType: "GUEST" },
      name: "TRANSACTION-PLAN",
      to: { planType: "GOLD" },
    },
    valueInCents: 2000,
    when: new Date("2024-06-01T10:00:00.000Z").toISOString(),
  }
}

type UserAdminListDatabase = Awaited<ReturnType<typeof getUserAdminListDatabase>>[number]
type UserAdminListDatabasePurchase = UserAdminListDatabase["purchases"][number]

function getUserAdminListDatabase(prisma: PrismaClient) {
  return prisma.user.findMany({
    select: {
      id_user: true,
      username: true,
      role: true,
      profilePic: true,
      plan: {
        include: {
          usages: true,
        },
      },
      purchases: { select: { id_Purchase: true } },
      status: true,
      steamAccounts: {
        select: { id_steamAccount: true, accountName: true },
      },
    },
  })
}
