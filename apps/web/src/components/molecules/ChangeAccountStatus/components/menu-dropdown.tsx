import { useSteamAccountListItem } from "@/components/molecules/SteamAccountListItem/context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { AppAccountStatus } from "core"
import React from "react"
import { toast } from "sonner"

export type MenuDropdownChangeAccountStatusProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuContent
> & {}

export const MenuDropdownChangeAccountStatus = React.memo(
  React.forwardRef<React.ElementRef<typeof DropdownMenuContent>, MenuDropdownChangeAccountStatusProps>(
    function MenuDropdownChangeAccountStatusComponent({ children, className, ...props }, ref) {
      const { handleChangeStatus, status } = useSteamAccountListItem()

      async function handleChangeStatusClick(newStatus: AppAccountStatus) {
        const [undesired] = await handleChangeStatus(newStatus)
        if (undesired) toast[undesired.type](undesired.message)
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
          <DropdownMenuContent
            {...props}
            className={cn("", className)}
            ref={ref}
          >
            <DropdownMenuItem
              className={cn(status === "online" && "bg-accent-950/50")}
              onClick={() => handleChangeStatusClick("online")}
            >
              On-line
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(status === "offline" && "bg-accent-950/50")}
              onClick={() => handleChangeStatusClick("offline")}
            >
              Off-line
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  )
)

MenuDropdownChangeAccountStatus.displayName = "MenuDropdownChangeAccountStatus"
