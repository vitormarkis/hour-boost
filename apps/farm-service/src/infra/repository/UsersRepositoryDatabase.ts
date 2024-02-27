import { $Enums, Plan, Prisma, PrismaClient } from "@prisma/client"
import {
  ActiveStatus,
  AdminRole,
  ApplicationError,
  BannedStatus,
  PlanAllNames,
  Purchase,
  Role,
  RoleName,
  Status,
  StatusName,
  SteamAccount,
  SteamAccountCredentials,
  SteamAccountList,
  Usage,
  UsageList,
  User,
  UserRole,
  UsersRepository,
} from "core"

import { getCurrentPlanOrCreateOne } from "~/utils"

export class UsersRepositoryDatabase implements UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findMany(): Promise<User[]> {
    const users = await prismaFindMany(this.prisma)
    const usersDomain = prismaUserListToDomain(users)
    return usersDomain
  }

  async dropAll(): Promise<void> {
    console.log("Você acidentalmente tentou limpar o banco de dados.")
  }
  async create(user: User): Promise<string> {
    const { id_user } = await this.prisma.user.create({
      data: {
        id_user: user.id_user,
        createdAt: new Date(),
        email: user.email,
        plan: {
          create: {
            createdAt: new Date(),
            id_plan: user.plan.id_plan,
            name: mapPlanName_toPrisma(user.plan.name),
            type: user.plan.type,
          },
        },
        profilePic: user.profilePic,
        role: user.role.name,
        status: user.status.name,
        username: user.username,
      },
    })

    return id_user
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: {
        id_user: user.id_user,
      },
      data: {
        email: user.email,
        plan: {
          connectOrCreate: {
            where: {
              id_plan: user.plan.id_plan,
            },
            create: {
              createdAt: new Date(),
              id_plan: user.plan.id_plan,
              name: mapPlanName_toPrisma(user.plan.name),
              type: user.plan.type,
              usages: {
                connectOrCreate: user.plan.usages.data.map(u => ({
                  where: { id_usage: u.id_usage },
                  create: {
                    amountTime: u.amountTime,
                    createdAt: new Date(),
                    id_usage: u.id_usage,
                    accountName: u.accountName,
                  },
                })),
              },
            },
          },
        },
        profilePic: user.profilePic,
        purchases: {
          connectOrCreate: user.purchases.map(p => ({
            where: { id_Purchase: p.id_Purchase },
            create: {
              createdAt: new Date(),
              id_Purchase: p.id_Purchase,
            },
          })),
        },
        role: user.role.name,
        status: user.status.name,
        username: user.username,
        steamAccounts: {
          disconnect: user.steamAccounts.getTrashIDs().map(id => ({ id_steamAccount: id })),
          connectOrCreate: user.steamAccounts.data.map(sa => ({
            where: { accountName: sa.credentials.accountName },
            create: {
              accountName: sa.credentials.accountName,
              createdAt: new Date(),
              id_steamAccount: sa.id_steamAccount,
              password: sa.credentials.password,
            },
          })),
        },
      },
    })
  }

  async getByID(userId: string): Promise<User | null> {
    const dbUser = await prismaGetUser(this.prisma, { userId })
    return dbUser ? prismaUserToDomain(dbUser) : null
  }

  async getByUsername(username: string): Promise<User | null> {
    const dbUser = await prismaGetUser(this.prisma, { username })
    return dbUser ? prismaUserToDomain(dbUser) : null
  }
}

export function roleFactory(role: RoleName): Role {
  if (role === "ADMIN") return new AdminRole()
  if (role === "USER") return new UserRole()
  throw new ApplicationError("Invalid role received: " + role)
}

export function statusFactory(status: StatusName): Status {
  if (status === "ACTIVE") return new ActiveStatus()
  if (status === "BANNED") return new BannedStatus()
  throw new ApplicationError("Invalid status received: " + status)
}

function prismaUserFindManyToUserDomain(user: PrismaFindMany[number]): User {
  const userPlan = getCurrentPlanOrCreateOne(user.plan, user.id_user)

  const steamAccounts: SteamAccountList = new SteamAccountList({
    data: user.steamAccounts.map(sa =>
      SteamAccount.restore({
        credentials: SteamAccountCredentials.restore({
          accountName: sa.accountName,
          password: sa.password,
        }),
        id_steamAccount: sa.id_steamAccount,
        ownerId: user.id_user,
        autoRelogin: sa.autoRelogin,
      })
    ),
  })

  return User.restore({
    email: user.email,
    id_user: user.id_user,
    username: user.username,
    plan: userPlan,
    profilePic: user.profilePic,
    purchases: user.purchases.map(p =>
      Purchase.restore({
        id_Purchase: p.id_Purchase,
      })
    ),
    role: roleFactory(user.role),
    status: statusFactory(user.status),
    steamAccounts,
    usages: new UsageList({
      data: user.usages.map(Usage.restore),
    }),
  })
}

export function prismaUserListToDomain(users: PrismaFindMany): User[] {
  return users.map(prismaUserFindManyToUserDomain)
}

export function prismaUserToDomain(dbUser: PrismaGetUser) {
  if (!dbUser) return null
  const steamAccounts: SteamAccountList = new SteamAccountList({
    data: dbUser.steamAccounts.map(sa =>
      SteamAccount.restore({
        credentials: SteamAccountCredentials.restore({
          accountName: sa.accountName,
          password: sa.password,
        }),
        id_steamAccount: sa.id_steamAccount,
        ownerId: dbUser.id_user,
        autoRelogin: sa.autoRelogin,
      })
    ),
  })

  const userPlan = getCurrentPlanOrCreateOne(dbUser.plan, dbUser.id_user)

  return User.restore({
    email: dbUser.email,
    id_user: dbUser.id_user,
    plan: userPlan,
    profilePic: dbUser.profilePic,
    username: dbUser.username,
    purchases: dbUser.purchases.map(p =>
      Purchase.restore({
        id_Purchase: p.id_Purchase,
      })
    ),
    steamAccounts,
    role: roleFactory(dbUser.role),
    status: statusFactory(dbUser.status),
    usages: new UsageList({
      data: dbUser.usages.map(Usage.restore),
    }),
  })
}

export type IGetUserProps = { userId: string } | { username: string }
export type PrismaFindMany = Awaited<ReturnType<typeof prismaFindMany>>
export type PrismaGetUser = Awaited<ReturnType<typeof prismaGetUser>>
export function prismaGetUser(prisma: PrismaClient, props: IGetUserProps) {
  return prisma.user.findUnique({
    where:
      "username" in props
        ? {
            username: props.username,
          }
        : {
            id_user: props.userId,
          },
    include: {
      plan: {
        include: {
          usages: true,
        },
      },
      purchases: true,
      steamAccounts: true,
      usages: true,
    },
  })
}

export function prismaFindMany(prisma: PrismaClient) {
  return prisma.user.findMany({
    include: {
      plan: {
        include: {
          usages: true,
        },
      },
      steamAccounts: true,
      purchases: true,
      usages: true,
    },
  })
}

export function mapPlanName_toDomain(planName: $Enums.PlanName): PlanAllNames {
  switch (planName) {
    case "DIAMOND":
    case "GOLD":
    case "GUEST":
    case "SILVER":
      return planName
    case "INFINITY_CUSTOM":
      return "INFINITY-CUSTOM"
    case "USAGE_CUSTOM":
      return "USAGE-CUSTOM"
  }
}

export function mapPlanName_toPrisma(planName: PlanAllNames): $Enums.PlanName {
  switch (planName) {
    case "DIAMOND":
    case "GOLD":
    case "GUEST":
    case "SILVER":
      return planName
    case "INFINITY-CUSTOM":
      return "INFINITY_CUSTOM"
    case "USAGE-CUSTOM":
      return "USAGE_CUSTOM"
  }
}
