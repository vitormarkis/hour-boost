import { Prisma, PrismaClient } from "@prisma/client"
import { Plan, GuestPlan, DiamondPlan, GoldPlan, SilverPlan, PlanPropsWithName, PlanCreateProps } from "core"
import { Status, StatusName, ActiveStatus, BannedStatus } from "core"
import {
  User,
  Purchase,
  SteamAccount,
  SteamAccountCredentials,
  SteamGame,
  RoleName,
  Role,
  AdminRole,
  UserRole,
} from "core"
import { UsersRepository } from "core"

import { getUserCurrentPlan } from "~/utils"

export class UsersRepositoryDatabase implements UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

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
            name: user.plan.name,
          },
        },
        profilePic: user.profilePic,
        role: user.role.name,
        status: user.status.name,
        username: user.username,
      },
      // include: {
      //   purchases: {
      //     select: { id_Purchase: true },
      //   },
      //   steamAccounts: {
      //     select: { id_steamAccount: true },
      //   },
      // },
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
              name: user.plan.name,
              usages: {
                connectOrCreate: user.plan.usages.map(u => ({
                  where: { id_usage: u.id_usage },
                  create: {
                    amountTime: u.amountTime,
                    createdAt: new Date(),
                    id_usage: u.id_usage,
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
          connectOrCreate: user.steamAccounts.map(sa => ({
            where: { id_steamAccount: sa.id_steamAccount },
            create: {
              accountName: sa.credentials.accountName,
              createdAt: new Date(),
              id_steamAccount: sa.id_steamAccount,
              password: sa.credentials.password,
              games: {
                connectOrCreate: sa.games.map(
                  g =>
                    ({
                      where: { id_steamGame: g.id_steamGame },
                      create: {
                        gameId: g.gameId,
                        id_steamGame: g.id_steamGame,
                      },
                    }) as Prisma.SteamGameCreateOrConnectWithoutSteamAccountInput
                ),
              },
            },
          })),
        },
      },
    })
  }

  async getByID(userId: string): Promise<User | null> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id_user: userId },
      include: {
        plan: {
          include: {
            usages: true,
          },
        },
        purchases: true,
        steamAccounts: {
          include: { games: true },
        },
      },
    })

    if (!dbUser) return null

    const steamAccounts: SteamAccount[] = dbUser.steamAccounts.map(sa =>
      SteamAccount.restore({
        credentials: SteamAccountCredentials.restore({
          accountName: sa.accountName,
          password: sa.password,
        }),
        games: sa.games.map(g =>
          SteamGame.restore({
            gameId: g.gameId,
            id_steamGame: g.id_steamGame,
          })
        ),
        id_steamAccount: sa.id_steamAccount,
      })
    )

    const userPlan = getUserCurrentPlan(dbUser.plan, { ownerId: dbUser.id_user })

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
      steamAccounts: steamAccounts,
      role: roleFactory(dbUser.role),
      status: statusFactory(dbUser.status),
    })
  }
}

export function planFactory<T extends PlanPropsWithName>(planProps: T): Plan {
  if (planProps.name === "GUEST") return GuestPlan.restore(planProps)
  if (planProps.name === "DIAMOND") return DiamondPlan.restore(planProps)
  if (planProps.name === "GOLD") return GoldPlan.restore(planProps)
  if (planProps.name === "SILVER") return SilverPlan.restore(planProps)
  throw new Error("Invalid plan received: " + planProps)
}

export function roleFactory(role: RoleName): Role {
  if (role === "ADMIN") return new AdminRole()
  if (role === "USER") return new UserRole()
  throw new Error("Invalid role received: " + role)
}

export function statusFactory(status: StatusName): Status {
  if (status === "ACTIVE") return new ActiveStatus()
  if (status === "BANNED") return new BannedStatus()
  throw new Error("Invalid status received: " + status)
}
