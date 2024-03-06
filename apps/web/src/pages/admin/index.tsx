import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { AdminUserListContent } from "@/components/layouts/pages/admin/components/AdminUserListContent"
import { UserProvider } from "@/contexts/UserContext"
import { api } from "@/lib/axios"
import { UserSessionParams, UserSessionParamsMaybe } from "@/server-fetch/types"
import { userProcedure } from "@/server-fetch/userProcedure"

export const getServerSideProps = userProcedure({
  shouldShowNotFoundPageWhen({ user }) {
    return user?.role !== "ADMIN"
  },
})

export default function AdminDashboard({ user, serverHeaders }: UserSessionParams) {
  for (const headerName in serverHeaders) {
    api.defaults.headers.common[headerName] = serverHeaders[headerName]
  }

  console.log(api.defaults.headers, { serverHeaders })

  return (
    <UserProvider serverUser={user}>
      <HeaderDashboard
        username={user.username}
        profilePic={user.profilePic}
      />
      <div className="mdx:px-8 mx-auto w-full max-w-[1440px] overflow-hidden">
        <AdminUserListContent />
      </div>
    </UserProvider>
  )
}
