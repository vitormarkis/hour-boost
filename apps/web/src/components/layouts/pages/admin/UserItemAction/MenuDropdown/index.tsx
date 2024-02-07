import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconClock, IconUser } from "@/components/layouts/UserPlanStatus/component"
import { ActionAddHoursMenuSubTrigger } from "../ActionAddHours/components/MenuSubTrigger"
import { ActionSetAccountsLimitMenuSubTrigger } from "../ActionSetAccountsLimit/components/MenuSubTrigger"
import { ActionSetGamesLimitMenuSubTrigger } from "../ActionSetGamesLimit/components/MenuSubTrigger"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import React from "react"

export type UserItemActionMenuDropdownProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

export const UserItemActionMenuDropdown = React.forwardRef<
  React.ElementRef<"div">,
  UserItemActionMenuDropdownProps
>(function UserItemActionMenuDropdownComponent({ children, className, ...props }, ref) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        {...props}
        className={cn("", className)}
        ref={ref}
      >
        <ActionAddHoursMenuSubTrigger>
          <IconClock className="fill-white size-3" />
          <span>Adicionar horas</span>
        </ActionAddHoursMenuSubTrigger>
        <ActionSetGamesLimitMenuSubTrigger>
          <IconJoystick className="fill-white size-3" />
          <span>Mudar número de jogos</span>
        </ActionSetGamesLimitMenuSubTrigger>
        <ActionSetAccountsLimitMenuSubTrigger>
          <IconUser className="fill-white size-3" />
          <span>Mudar número de contas</span>
        </ActionSetAccountsLimitMenuSubTrigger>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

UserItemActionMenuDropdown.displayName = "UserItemActionMenuDropdown"
