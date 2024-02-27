import { PlanInfinity, PlanUsage, SteamAccount } from "core"

type TrimAccountsNameProps = {
  steamAccounts: SteamAccount[]
  newPlan: PlanInfinity | PlanUsage
}

export function trimAccountsName({ newPlan, steamAccounts }: TrimAccountsNameProps) {
  const allAccountNames = steamAccounts.map(sa => sa.credentials.accountName)
  const trimmingAccountNameList = [...allAccountNames].splice(
    newPlan.maxSteamAccounts,
    allAccountNames.length
  )
  return trimmingAccountNameList
}
