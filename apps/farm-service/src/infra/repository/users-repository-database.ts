import { Prisma, PrismaClient } from "@prisma/client"
import { Plan, PlanName, GuestPlan, DiamondPlan, GoldPlan, SilverPlan } from "core"
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

export class UsersRepositoryDatabase implements UsersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: {
        id_user: user.id_user,
      },
      data: {
        email: user.email,
        plan: user.plan.name,
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

  async getByID(userId: string): Promise<User> {
    const dbUser = await this.prisma.user.findUniqueOrThrow({
      where: { id_user: userId },
      include: {
        purchases: true,
        steamAccounts: {
          include: { games: true },
        },
      },
    })

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

    return User.restore({
      email: dbUser.email,
      id_user: dbUser.id_user,
      plan: planFactory(dbUser.plan),
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

export function planFactory(plan: PlanName): Plan {
  if (plan === "GUEST") return GuestPlan.restore()
  if (plan === "DIAMOND") return DiamondPlan.restore()
  if (plan === "GOLD") return GoldPlan.restore()
  if (plan === "SILVER") return SilverPlan.restore()
  throw new Error("Invalid plan received: " + plan)
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
