import { HeaderDashboard } from "@/components/layouts/Header/header-dashboard"
import { UserAdminItemList } from "@/components/layouts/pages/admin/components/AdminUserItemList"
import { ApplicationStatus } from "@/components/layouts/pages/admin/components/ApplicationStatus"
import { UserProvider } from "@/contexts/UserContext"
import { UserSessionParams } from "@/server-fetch/types"
import { userProcedure } from "@/server-fetch/userProcedure"
import { GetServerSideProps } from "next"

export const getServerSideProps: GetServerSideProps = userProcedure({
  shouldShowNotFoundPageWhen({ user }) {
    return user?.role !== "ADMIN"
  },
})

export default function AdminDashboard({ user, serverHeaders }: UserSessionParams) {
  return (
    <UserProvider
      serverUser={user}
      serverHeaders={serverHeaders}
    >
      <HeaderDashboard
        username={user.username}
        profilePic={user.profilePic}
      />
      <div className="max-w-[1440px] w-full mx-auto mdx:px-8 overflow-hidden">
        <div className="mt-8">
          <ApplicationStatus />
          <UserAdminItemList />
        </div>
      </div>
    </UserProvider>
  )
}
