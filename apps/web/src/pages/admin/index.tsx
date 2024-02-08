import { UserAdminItemList } from "@/components/AdminUserItemList"
import { IconChevron } from "@/components/icons/IconChevron"
import { IconCircleDollar } from "@/components/icons/IconCircleDollar"
import { IconUserMinus } from "@/components/icons/IconUserMinus"
import { IconUserX } from "@/components/icons/IconUserX"
import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { UserItemActionMenuDropdown } from "@/components/layouts/pages/admin/UserItemAction/MenuDropdown"
import { ECacheKeys } from "@/mutations/queryKeys"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion"
import { useQuery } from "@tanstack/react-query"

const USERS = [
  {
    id_user: "33ede51a-6f05-4ee5-969b-334f8c49e2c3",
    username: "josevitor",
    profilePicture: "https://avatars.githubusercontent.com/u/121525239?v=4",
    plan: {
      name: "Diamante",
      maxGamesAllowed: 32,
      maxSteamAccounts: 1,
      maxUsageTime: 3600 * 6,
      id_plan: "102f5f6d-42d6-4433-ae72-189e2a43a885",
    },
  },
  {
    id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff",
    username: "felipedeschamps",
    profilePicture: "https://avatars.githubusercontent.com/u/4248081?v=4",
    plan: {
      name: "Diamante",
      maxGamesAllowed: 1,
      maxSteamAccounts: 2,
      maxUsageTime: 7200,
      id_plan: "5c39e8da-6519-4ac1-85a5-1dd2b146310c",
    },
  },
  {
    id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff2",
    username: "dwilt",
    profilePicture: "https://github.com/dwilt.png",
    plan: {
      name: "Diamante",
      maxGamesAllowed: 1,
      maxSteamAccounts: 2,
      maxUsageTime: 7200,
      id_plan: "6db79cee-2f1c-4fff-a08a-9437a35daeed",
    },
  },
  {
    id_user: "21f8e4d7-0b05-4af3-8cd1-11f1ce3455ff1",
    username: "OmerCohenAviv",
    profilePicture: "https://github.com/OmerCohenAviv.png",
    plan: {
      name: "Diamante",
      maxGamesAllowed: 1,
      maxSteamAccounts: 2,
      maxUsageTime: 7200,
      id_plan: "f6a9727b-f226-4021-abdb-f38446305980",
    },
  },
]

export type UserAdminPanelSession = (typeof USERS)[number]

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
