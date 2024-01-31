import { IconChevron } from "@/components/icons/IconChevron"
import { HeaderStructure } from "@/components/layouts/Header/header-structure"
import { MenuDropdownUserHeader } from "@/components/molecules/menu-dropdown-user-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { getUserInitials } from "@/util/getUserInitials"
import { RoleName } from "core"
import React from "react"

export type HeaderDashboardProps = Omit<
  React.ComponentPropsWithoutRef<typeof HeaderStructure>,
  "children"
> & {}

export const HeaderDashboard = React.forwardRef<
  React.ElementRef<typeof HeaderStructure>,
  HeaderDashboardProps
>(function HeaderDashboardComponent({ className, ...props }, ref) {
  const user = useUser()
  const userInitials = getUserInitials(user)

  return (
    <HeaderStructure
      {...props}
      className={cn("gap-8", className)}
      ref={ref}
    >
      <div className="flex-1 h-full flex gap-4 items-center">
        <div className="shrink-0 flex items-center">
          <img
            src="logo.png"
            alt=""
            className="h-[1.7rem]"
          />
        </div>
      </div>
      <div className="flex-1 h-full flex gap-4 items-center justify-end">
        <div className="hidden sm:flex">
          <span className="font-medium text-white text-sm">{user.username}</span>
        </div>
        <MenuDropdownUserHeader>
          <div className="flex items-center h-9 px-1 hover:bg-slate-800 cursor-pointer rounded-sm">
            <Avatar className="h-7 w-7 rounded-sm">
              <AvatarImage src={user.profilePic} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex items-center justify-center ml-0.5">
              <IconChevron className="size-3.5 text-slate-400" />
            </div>
          </div>
        </MenuDropdownUserHeader>
      </div>
    </HeaderStructure>
  )
})

export type RoleBadgeProps = React.ComponentPropsWithoutRef<"div"> & {
  role: RoleName
}

export const RoleBadge = React.forwardRef<React.ElementRef<"div">, RoleBadgeProps>(
  function RoleBadgeComponent({ role, className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("flex items-center gap-2 text-sm", className)}
        ref={ref}
      >
        <span className="font-semibold">Cargo:</span>
        <span
          className={cn("leading-none py-1 px-2 rounded-md bg-indigo-600", {
            "bg-lime-500/90": role === "ADMIN",
          })}
        >
          {role}
        </span>
      </div>
    )
  }
)

RoleBadge.displayName = "RoleBadge"

HeaderDashboard.displayName = "HeaderDashboard"
