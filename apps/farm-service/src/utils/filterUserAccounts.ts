import { PlanInfinity, PlanUsage, User } from "core"

export const filterUserAccounts = (user: User) => ({
  username: user.username,
  userSteamAccounts: user.steamAccounts.data.map(sa => sa.credentials.accountName),
})
export const filterPlanUsages = (plan: PlanUsage | PlanInfinity) => ({
  planname: plan.name,
  planUsages: plan.usages.data.map(u => ({
    accountName: u.accountName,
    amountTime: u.amountTime,
    id_usage: u.id_usage,
  })),
})
