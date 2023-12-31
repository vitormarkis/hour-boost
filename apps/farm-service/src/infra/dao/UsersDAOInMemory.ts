import { DatabaseSteamAccount, ISteamAccountSession, PlanUsage, UserSession, UsersDAO } from "core"
import { UsersInMemory } from "~/infra/repository"

export class UsersDAOInMemory implements UsersDAO {
  constructor(private readonly users: UsersInMemory) {}

  async getPlanId(userId: string): Promise<string | null> {
    const dbUser = this.users.users.find(u => u.id_user === userId)
    return !dbUser ? null : dbUser.plan.id_plan
  }

  async getUsername(userId: string): Promise<{ username: string } | null> {
    const dbUser = this.users.users.find(u => u.id_user === userId)
    return dbUser
      ? {
          username: dbUser.username,
        }
      : null
  }

  async getByID(userId: string): Promise<UserSession | null> {
    const foundUser = this.users.users.find(u => u.id_user === userId) ?? null

    if (!foundUser) return null

    return {
      email: foundUser.email,
      id_user: foundUser.id_user,
      plan:
        foundUser.plan instanceof PlanUsage
          ? {
              autoRestarter: foundUser.plan.autoRestarter,
              maxGamesAllowed: foundUser.plan.maxGamesAllowed,
              maxSteamAccounts: foundUser.plan.maxSteamAccounts,
              maxUsageTime: foundUser.plan.maxUsageTime,
              name: foundUser.plan.name,
              type: foundUser.plan.type as "USAGE",
            }
          : {
              autoRestarter: foundUser.plan.autoRestarter,
              maxGamesAllowed: foundUser.plan.maxGamesAllowed,
              maxSteamAccounts: foundUser.plan.maxSteamAccounts,
              name: foundUser.plan.name,
              type: foundUser.plan.type as "INFINITY",
            },
      profilePic: foundUser.profilePic,
      purchases: foundUser.purchases.map(p => p.id_Purchase),
      role: foundUser.role.name,
      status: foundUser.status.name,
      steamAccounts: foundUser.steamAccounts.data.map(sa => sa.id_steamAccount),
      username: foundUser.username,
    }
  }

  async getUsersSteamAccounts(userId: string): Promise<DatabaseSteamAccount[]> {
    const user = this.users.users.find(u => u.id_user === userId) ?? null
    if (!user) return []
    return user.steamAccounts.data.map(sa => ({
      accountName: sa.credentials.accountName,
      id_steamAccount: sa.id_steamAccount,
      userId,
    }))
  }
}
