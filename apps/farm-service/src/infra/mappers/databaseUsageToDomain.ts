import { Usage, UsageList } from "core"

type DBUsage = {
  id_usage: string
  createdAt: Date
  amountTime: number
  plan_id: string | null
  custom_plan_id: string | null
  user_id: string
  accountName: string
}

export function databaseUsageToDomain(dbUsage: DBUsage) {
  return Usage.restore({
    accountName: dbUsage.accountName,
    amountTime: dbUsage.amountTime,
    createdAt: dbUsage.createdAt,
    id_usage: dbUsage.id_usage,
    plan_id: dbUsage.plan_id ?? dbUsage.custom_plan_id!,
    user_id: dbUsage.user_id,
  })
}

export function databaseUsageListToDomain(usages: DBUsage[]): UsageList {
  return new UsageList({
    data: usages.map(databaseUsageToDomain),
  })
}
