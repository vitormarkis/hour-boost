import { PlanInfinity, PlanUsage, User } from "core"

export const filterUserAccounts = (user: User, ownerId?: "ownerId") => ({
  username: user.username,
  userSteamAccounts: user.steamAccounts.data.map(sa =>
    ownerId
      ? sa.credentials.accountName
      : {
          accountName: sa.credentials.accountName,
          ownerId: sa.ownerId,
        }
  ),
})
export const filterPlanUsages = (plan: PlanUsage | PlanInfinity) => ({
  planname: plan.name,
  planUsages: plan.usages.data.map(u => ({
    accountName: u.accountName,
    amountTime: u.amountTime,
    id_usage: u.id_usage,
  })),
})
