import { UserAdminItemList } from "@/components/AdminUserItemList"
import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { ECacheKeys } from "@/mutations/queryKeys"
import { useQuery } from "@tanstack/react-query"
import {
  PlanAllNames,
  PlanInfinity,
  PlanInfinitySession,
  PlanSession,
  PlanUsage,
  PlanUsageSession,
} from "core"

const USERS: UserAdminPanelSession[] = [
  {
    id_user: "33ede51a-6f05-4ee5-969b-334f8c49e2c3",
    username: "josevitor",
    profilePicture: "https://avatars.githubusercontent.com/u/121525239?v=4",
    plan: {
      maxGamesAllowed: 32,
      maxSteamAccounts: 1,
      maxUsageTime: 3600 * 6,
      id_plan: "102f5f6d-42d6-4433-ae72-189e2a43a885",
      autoRestarter: false,
      farmUsedTime: 0,
      name: "GUEST",
      type: "USAGE",
    } satisfies PlanUsageSession,
    purchases: [
      {
        id_Purchase: "ec768f0f-223a-4b6d-b06b-76200fc6019e",
        when: new Date("2023-12-31T10:00:00.000Z"),
        valueInCents: 2700,
        type: {
          name: "TRANSACTION-PLAN",
          from: {
            planType: "GUEST",
          },
          to: {
            planType: "GOLD",
          },
        },
      },
      {
        id_Purchase: "5634b221-3906-4585-bcea-62f78d9bb76f",
        when: new Date("2024-01-26T17:00:00.000Z"),
        valueInCents: 2150,
        type: {
          name: "TRANSACTION-PLAN",
          from: {
            planType: "GOLD",
          },
          to: {
            planType: "DIAMOND",
          },
        },
      },
    ],
  },
  {
    id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff",
    username: "felipedeschamps",
    profilePicture: "https://avatars.githubusercontent.com/u/4248081?v=4",
    plan: {
      maxGamesAllowed: 1,
      maxSteamAccounts: 2,
      maxUsageTime: 7200,
      id_plan: "5c39e8da-6519-4ac1-85a5-1dd2b146310c",
      autoRestarter: false,
      farmUsedTime: 0,
      name: "GUEST",
      type: "USAGE",
    } satisfies PlanUsageSession,
    purchases: [],
  },
  {
    id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff2",
    username: "dwilt",
    profilePicture: "https://github.com/dwilt.png",
    plan: {
      maxGamesAllowed: 1,
      maxSteamAccounts: 2,
      maxUsageTime: 7200,
      id_plan: "6db79cee-2f1c-4fff-a08a-9437a35daeed",
      autoRestarter: false,
      farmUsedTime: 0,
      name: "GUEST",
      type: "USAGE",
    } satisfies PlanUsageSession,
    purchases: [],
  },
  {
    id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff1",
    username: "OmerCohenAviv",
    profilePicture: "https://github.com/OmerCohenAviv.png",
    plan: {
      maxGamesAllowed: 1,
      maxSteamAccounts: 2,
      maxUsageTime: 7200,
      id_plan: "f6a9727b-f226-4021-abdb-f38446305980",
      autoRestarter: false,
      farmUsedTime: 0,
      name: "GUEST",
      type: "USAGE",
    } satisfies PlanUsageSession,
    purchases: [],
  },
]

export type UserAdminPanelSession = {
  id_user: string
  username: string
  profilePicture: string
  plan: PlanUsageSession | PlanInfinitySession
  purchases: PurchaseSession[]
}
export type PurchaseSession = {
  id_Purchase: string
  valueInCents: number
  type: PurchasePayloadSession
  when: Date
}

export type PurchasePayloadSession = IPurchasePayloadTransactionPlan
export type PurchaseType = PurchasePayloadSession["name"]

export type IPurchasePayloadTransactionPlan = {
  name: "TRANSACTION-PLAN"
  from: {
    planType: PlanAllNames
  }
  to: {
    planType: PlanAllNames
  }
}

export default function AdminDashboard() {
  const { data: userAdminItemList } = useQuery({
    queryKey: ECacheKeys["USER-ADMIN-ITEM-LIST"],
    initialData: USERS as UserAdminPanelSession[],
  })

  return (
    <>
      <HeaderDashboard />
      <div className="max-w-[1440px] w-full mx-auto mdx:px-8">
        <div className="border border-slate-700/50 mt-8">
          {userAdminItemList.map(user => (
            <UserAdminItemList
              user={user}
              key={user.id_user}
            />
          ))}
        </div>
      </div>
    </>
  )
}
