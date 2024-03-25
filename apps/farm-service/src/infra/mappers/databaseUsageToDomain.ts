import { Usage, UsageList, makeError } from "core"

type DBUsage = {
  id_usage: string
  createdAt: Date
  amountTime: number
  plan_id: string | null
  user_id: string
  accountName: string
}

export function databaseUsageToDomain(dbUsage: DBUsage) {
  if (!dbUsage.plan_id) throw makeError("Usage sem plan id.", { dbUsage })
  return Usage.restore({
    accountName: dbUsage.accountName,
    amountTime: dbUsage.amountTime,
    createdAt: dbUsage.createdAt,
    id_usage: dbUsage.id_usage,
    plan_id: dbUsage.plan_id,
    user_id: dbUsage.user_id,
  })
}

export function databaseUsageListToDomain(usages: DBUsage[]): UsageList {
  return new UsageList({
    data: usages.map(databaseUsageToDomain),
  })
}
