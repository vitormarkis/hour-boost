import { IconLike } from "@/components/icons/IconLike"
import { ActionSetGamesLimitMenuSubContent } from "./MenuSubContent"
import {
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import React from "react"

export type ActionSetGamesLimitMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuSubTrigger
> & {
  children: React.ReactNode
}

export const ActionSetGamesLimitMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubTrigger>,
  ActionSetGamesLimitMenuSubTriggerProps
>(function ActionSetGamesLimitMenuSubTriggerComponent({ children, className, ...props }, ref) {
  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger
          {...props}
          className={cn("flex gap-2", className)}
          ref={ref}
        >
          {children}
        </DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <ActionSetGamesLimitMenuSubContent className="overflow-visible">
            <IconLike className="size-3 text-white" />
          </ActionSetGamesLimitMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  )
})

ActionSetGamesLimitMenuSubTrigger.displayName = "ActionSetGamesLimitMenuSubTrigger"
