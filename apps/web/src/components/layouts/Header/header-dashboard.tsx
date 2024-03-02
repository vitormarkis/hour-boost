import { IconChevron } from "@/components/icons/IconChevron"
import { HeaderStructure } from "@/components/layouts/Header/header-structure"
import { MenuDropdownUserHeader } from "@/components/molecules/menu-dropdown-user-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { getUserInitials } from "@/util/getUserInitials"
import { RoleName } from "core"
import React from "react"

export type HeaderDashboardProps = Omit<
  React.ComponentPropsWithoutRef<typeof HeaderStructure>,
  "children"
> & {
  username: string
  profilePic: string
}

export const HeaderDashboard = React.forwardRef<
  React.ElementRef<typeof HeaderStructure>,
  HeaderDashboardProps
>(function HeaderDashboardComponent({ username, profilePic, className, ...props }, ref) {
  const userInitials = getUserInitials(username)

  return (
    <HeaderStructure
      {...props}
      className={cn("gap-8", className)}
      ref={ref}
    >
      <div className="flex h-full flex-1 items-center gap-4">
        <div className="flex shrink-0 items-center">
          <img
            src="logo.png"
            alt=""
            className="h-[1.7rem]"
          />
        </div>
      </div>
      <div className="flex h-full flex-1 items-center justify-end gap-4">
        <div className="hidden sm:flex">
          <span className="text-sm font-medium text-white">{username}</span>
        </div>
        <MenuDropdownUserHeader>
          <div className="flex h-9 cursor-pointer items-center rounded-sm px-1 hover:bg-slate-800">
            <Avatar className="h-7 w-7 rounded-sm">
              <AvatarImage src={profilePic} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-0.5 flex items-center justify-center">
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
          className={cn("rounded-md bg-indigo-600 px-2 py-1 leading-none", {
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
