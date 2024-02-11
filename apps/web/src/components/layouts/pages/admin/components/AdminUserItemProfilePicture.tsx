import React, { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useUserAdminListItem } from "../hooks/useUserAdminListItem"
import { useUserAdminItemId } from "../UserItemAction/context"

export type AdminUserItemProfilePictureProps = React.ComponentPropsWithoutRef<"div"> & {}

export const AdminUserItemProfilePicture = React.forwardRef<
  React.ElementRef<"div">,
  AdminUserItemProfilePictureProps
>(function AdminUserItemProfilePictureComponent({ className, ...props }, ref) {
  const userId = useUserAdminItemId()
  const profilePicture = useUserAdminListItem(userId, user => user.profilePicture)
  const status = useUserAdminListItem(userId, user => user.status)
  const isBanned = useMemo(() => status === "BANNED", [status])

  return (
    <div
      {...props}
      className={cn("h-20 w-20 grid place-items-center", className)}
      ref={ref}
    >
      <div className="h-[4.75rem] w-[4.75rem] relative grid place-items-center">
        <div className="h-[4.5rem] w-[4.5rem] relative shadow-lg shadow-black/50 rounded overflow-hidden">
          <img
            src={profilePicture}
            // alt={`${user.username}'s profile picture.`}
            className={cn("h-full w-full absolute inset-0", isBanned && "opacity-50")}
          />
          <div className="inset-0 bg-black" />
        </div>
        {isBanned && (
          <span className="flex items-center h-4 text-2xs px-1 bg-red-500 absolute left-0 top-0 -translate-y-1/2 -translate-x-2 z-30">
            banido
          </span>
        )}
      </div>
    </div>
  )
})

AdminUserItemProfilePicture.displayName = "AdminUserItemProfilePicture"
