import { IconJoystick } from "@/components/icons/IconJoystick"
import { IconClock, IconUser } from "@/components/layouts/UserPlanStatus/component"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import React from "react"
import { ActionAddHoursMenuSubTrigger } from "../ActionAddHours/components/MenuSubTrigger"
import { ActionSetAccountsLimitMenuSubTrigger } from "../ActionSetAccountsLimit/components/MenuSubTrigger"
import { ActionSetGamesLimitMenuSubTrigger } from "../ActionSetGamesLimit/components/MenuSubTrigger"
import { useUserAdminItem } from "../context"

export type UserItemActionMenuDropdownProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
  preventDefault?: boolean
}

export const UserItemActionMenuDropdown = React.forwardRef<
  React.ElementRef<"div">,
  UserItemActionMenuDropdownProps
>(function UserItemActionMenuDropdownComponent(
  { children, preventDefault = false, className, ...props },
  ref
) {
  const planType = useUserAdminItem(user => user.plan.type)
  const planIsUsage = planType === "USAGE"

  return (
    <DropdownMenu open={preventDefault ? false : undefined}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        {...props}
        className={cn("", className)}
        ref={ref}
      >
        {planIsUsage && (
          <ActionAddHoursMenuSubTrigger>
            <IconClock className="fill-white size-3" />
            <span>Adicionar horas</span>
          </ActionAddHoursMenuSubTrigger>
        )}
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
