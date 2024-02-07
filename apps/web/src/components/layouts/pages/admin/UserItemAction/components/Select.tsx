import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import React from "react"
import { cn } from "@/lib/utils"

export const ActionSelect = Select

export const ActionSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  React.ComponentPropsWithoutRef<typeof SelectTrigger>
>(function ActionSelectTriggerComponent({ className, ...props }, ref) {
  return (
    <SelectTrigger
      size="sm"
      {...props}
      className={cn("w-[180px] tabular-nums", className)}
      ref={ref}
    />
  )
})

ActionSelectTrigger.displayName = "ActionSelectTrigger"

export const ActionSelectValue = SelectValue

export const ActionSelectContent = SelectContent

export const ActionSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectItem>,
  React.ComponentPropsWithoutRef<typeof SelectItem>
>(function ActionSelectItemComponent({ className, ...props }, ref) {
  return (
    <SelectItem
      {...props}
      className={cn("data-[selected=true]:bg-slate-800 data-[selected=true]:hover:bg-accent", className)}
      ref={ref}
    />
  )
})

ActionSelectItem.displayName = "ActionSelectItem"
