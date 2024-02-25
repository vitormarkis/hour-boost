import { cn } from "@/lib/utils"
import { atom } from "jotai"
import React, { useTransition } from "react"
import { UserAdminItemList } from "./AdminUserItemList"
import { ApplicationStatus } from "./ApplicationStatus"
import { FilterAdminPanelInput } from "./FilterAdminPanelInput"

export type AdminUserListContentProps = React.ComponentPropsWithoutRef<"div"> & {}

export const filterInputAtom = atom("")

export const AdminUserListContent = React.forwardRef<React.ElementRef<"div">, AdminUserListContentProps>(
  function AdminUserListContentComponent({ className, ...props }, ref) {
    const [isPending, startTransition] = useTransition()

    return (
      <div
        {...props}
        className={cn("mt-8", className)}
        ref={ref}
      >
        <div className="flex items-center justify-between">
          <ApplicationStatus />
          <FilterAdminPanelInput startTransition={startTransition} />
        </div>
        <UserAdminItemList isPending={isPending} />
      </div>
    )
  }
)

AdminUserListContent.displayName = "AdminUserListContent"
