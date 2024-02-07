import { IconPlus } from "@/components/icons/IconPlus"
import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import React, { useState } from "react"
import { Pieces } from "../../components/MenuSubContentPieces"
import { useUserAdminItem } from "../../context"
import { Hours, Minutes } from "../value-objects"

export type ActionAddHoursMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuSubContent
> & {
  children: React.ReactNode
  setValue: (value: number) => void
}

export const ActionAddHoursMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubContent>,
  ActionAddHoursMenuSubContentProps
>(function ActionAddHoursMenuSubContentComponent({ setValue, children, ...props }, ref) {
  const [isSure, setIsSure] = useState(false)
  // const maxUsageTime = useUserAdminStore(state => state.maxUsageTime)
  const maxUsageTime = useUserAdminItem(state => state.plan.maxUsageTime)
  const [hours, setHours] = useState("0")
  const [minutes, setMinutes] = useState("30")

  const user = useUser()

  const handleClick = () => {
    setIsSure(true)

    if (isSure) {
    }
  }

  const handleHoursOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueUnparsed = parseInt(e.target.value)
    const [error, hours] = Hours.create(valueUnparsed)
    if (error) return
    setHours(hours.getValue())
  }

  const handleMinutesOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valueUnparsed = parseInt(e.target.value)
    const [error, minutes] = Minutes.create(valueUnparsed)
    if (error) return
    setMinutes(minutes.getValue())
  }

  return (
    <Pieces.Container
      {...props}
      className={cn("border border-slate-900", props.className)}
      ref={ref}
    >
      <Pieces.Header>
        <Pieces.HeaderTitle>Tempo restante:</Pieces.HeaderTitle>
        <Pieces.HeaderSubjectAmount className="text-white font-medium pl-2">
          {(maxUsageTime / 3600).toFixed(2)} horas
        </Pieces.HeaderSubjectAmount>
      </Pieces.Header>
      <Pieces.Footer>
        <Pieces.Input
          type="number"
          value={hours}
          onChange={handleHoursOnChange}
        />
        <Pieces.Input
          type="number"
          value={minutes}
          onChange={handleMinutesOnChange}
        />
        {!isSure && (
          <ActionAddHoursMenuSubContentTrigger onClick={handleClick}>
            <IconPlus className="size-3 text-white" />
          </ActionAddHoursMenuSubContentTrigger>
        )}
        {isSure && children}
      </Pieces.Footer>
    </Pieces.Container>
  )
})

ActionAddHoursMenuSubContent.displayName = "ActionAddHoursMenuSubContent"

export type ActionAddHoursMenuSubContentTriggerProps = React.ComponentPropsWithoutRef<"button"> & {}

export const ActionAddHoursMenuSubContentTrigger = React.forwardRef<
  React.ElementRef<"button">,
  ActionAddHoursMenuSubContentTriggerProps
>(function ActionAddHoursMenuSubContentTriggerComponent({ className, ...props }, ref) {
  return (
    <button
      {...props}
      className={cn("px-3 hover:bg-slate-800 relative", className)}
      ref={ref}
    />
  )
})

ActionAddHoursMenuSubContentTrigger.displayName = "ActionAddHoursMenuSubContentTrigger"
