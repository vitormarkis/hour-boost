import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { ModalAddSteamAccount } from "@/components/molecules/modal-add-steam-account"
import { Button } from "@/components/ui/button"
import { API_GET_SteamAccounts, ISteamAccountSession, UserSession } from "core"
import { GetServerSideProps } from "next"
import React from "react"
import { useAuth } from "@clerk/clerk-react"

// export const getServerSideProps: GetServerSideProps = async ctx => {
//   const { data: user } = await api.get<UserSession | null>("/me", {
//     headers: ctx.req.headers as Record<string, string>,
//   })

//   if (!user) {
//     return {
//       redirect: {
//         destination: "/sign-in",
//         permanent: false,
//       },
//     }
//   }

//   return {
//     props: {
//       user,
//     } as UserSessionParams,
//   }
// }

type UserSessionParams = {
  user: UserSession
}

export default function DashboardPage({}: UserSessionParams) {
  const user: UserSession = {
    email: "vitormarkis2369@gmail.com",
    id_user: "user_2XhCIwGjiPYDC35lIWBpF0OapkN",
    plan: {
      type: "USAGE",
      name: "GUEST",
      autoRestarter: true,
      maxGamesAllowed: 42,
      maxSteamAccounts: 4,
      maxUsageTime: 24800,
    },
    profilePic:
      "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yWGhDSXdyQXJhdDFyc09KVkROYUZmYmNOcjgifQ",
    purchases: [],
    role: "USER",
    status: "ACTIVE",
    steamAccounts: ["2c688339-d4fb-454e-a40e-16c773077a13", "2f225aef-af7b-4ed8-9df1-8d9ecbaaba28"],
    username: "vitormarkisx",
  }

  return (
    <>
      <HeaderDashboard user={user} />
      {/* <div className="max-w-[1440px] w-full mx-auto px-8">
        <ModalAddSteamAccount userId={user.id_user}>
          <Button className="h-9">Adicionar conta +</Button>
        </ModalAddSteamAccount>
      </div> */}
      <div className="max-w-[1440px] w-full mx-auto px-8">
        <DashboardSteamAccountsList user={user} />
      </div>
    </>
  )
}

import { cn } from "@/lib/utils"
import { SteamAccountListItem } from "@/components/molecules/SteamAccountListItem"
import { DashboardSteamAccountsList } from "@/components/layouts/DashboardSteamAccountsList"

export function isResponseOK(status: number) {
  return status >= 200 && status <= 299
}
