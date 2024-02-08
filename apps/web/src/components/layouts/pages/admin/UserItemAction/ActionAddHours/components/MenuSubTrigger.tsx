import { IconLike } from "@/components/icons/IconLike"
import {
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import React from "react"
import { ActionAddHoursMenuSubContent } from "./MenuSubContent"

export type ActionAddHoursMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuSubTrigger
> & {
  children: React.ReactNode
}

export const ActionAddHoursMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubTrigger>,
  ActionAddHoursMenuSubTriggerProps
>(function ActionAddHoursMenuSubTriggerComponent({ children, className, ...props }, ref) {
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
          <ActionAddHoursMenuSubContent>
            <IconLike className="size-3 text-white" />
          </ActionAddHoursMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  )
})

ActionAddHoursMenuSubTrigger.displayName = "ActionAddHoursMenuSubTrigger"
