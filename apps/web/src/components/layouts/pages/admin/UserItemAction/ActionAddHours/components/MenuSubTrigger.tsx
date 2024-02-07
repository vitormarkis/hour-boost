import React, { useState } from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { IconLike } from "@/components/icons/IconLike"
import { ActionAddHoursMenuSubContent, ActionAddHoursMenuSubContentTrigger } from "./MenuSubContent"
import { CommandTrigger } from "../promise"

export type ActionAddHoursMenuSubTriggerProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuSubTrigger
> & {
  children: React.ReactNode
}

export const ActionAddHoursMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubTrigger>,
  ActionAddHoursMenuSubTriggerProps
>(function ActionAddHoursMenuSubTriggerComponent({ children, className, ...props }, ref) {
  const [value, setValue] = useState<number | undefined>()

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
          <ActionAddHoursMenuSubContent setValue={value => setValue(value)}>
            <CommandTrigger value={value ?? 0}>
              <ActionAddHoursMenuSubContentTrigger className="hover:bg-accent">
                <IconLike className="size-3 text-white" />
              </ActionAddHoursMenuSubContentTrigger>
            </CommandTrigger>
          </ActionAddHoursMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  )
})

ActionAddHoursMenuSubTrigger.displayName = "ActionAddHoursMenuSubTrigger"
