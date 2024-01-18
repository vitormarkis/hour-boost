import { useSteamAccountListItem } from "@/components/molecules/SteamAccountListItem/context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import React from "react"

export type MenuDropdownChooseAccountStatusProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuContent
> & {}

export const MenuDropdownChooseAccountStatus = React.forwardRef<
  React.ElementRef<typeof DropdownMenuContent>,
  MenuDropdownChooseAccountStatusProps
>(function MenuDropdownChooseAccountStatusComponent({ children, className, ...props }, ref) {
  const { setStatus } = useSteamAccountListItem()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none flex items-center">{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        {...props}
        className={cn("", className)}
        ref={ref}
      >
        <DropdownMenuItem onClick={() => setStatus("online")}>On-line</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus("offline")}>Off-line</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

MenuDropdownChooseAccountStatus.displayName = "MenuDropdownChooseAccountStatus"
