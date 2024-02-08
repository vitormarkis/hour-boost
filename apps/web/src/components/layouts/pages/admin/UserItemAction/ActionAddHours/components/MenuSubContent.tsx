import { IconPlus } from "@/components/icons/IconPlus"
import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import React, { useReducer, useState } from "react"
import { Pieces } from "../../components/MenuSubContentPieces"
import { useUserAdminItem } from "../../context"
import { Hours, Minutes } from "../value-objects"
import { IconSpinner } from "@/components/icons/IconSpinner"
import twc from "tailwindcss/colors"
import { isMutationPending } from "../../ActionSetGamesLimit/components/MenuSubContent"
import { ECacheKeys } from "@/mutations/queryKeys"
import { HoverCard } from "../../components"
import { useAuth } from "@clerk/clerk-react"
import { api } from "@/lib/axios"
import { useUserAdminActionAddHours } from "../mutation"
import { toast } from "sonner"
import { secondsToHoursAndMinutes } from "@/lib/secondsToHoursAndMinutes"

export type ActionAddHoursMenuSubContentProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuSubContent
> & {
  children?: React.ReactNode | null
}

export const ActionAddHoursMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuSubContent>,
  ActionAddHoursMenuSubContentProps
>(function ActionAddHoursMenuSubContentComponent({ children, ...props }, ref) {
  const [isSure, setIsSure] = useState(false)
  // const maxUsageTime = useUserAdminStore(state => state.maxUsageTime)
  const maxUsageTime = useUserAdminItem(state => state.plan.maxUsageTime)
  const userId = useUserAdminItem(user => user.id_user)
  const planId = useUserAdminItem(state => state.plan.id_plan)
  const [hours, setHours] = useState("2")
  const [minutes, setMinutes] = useState("30")
  const finalHoursInSeconds = parseInt(hours) * 60 * 60 + parseInt(minutes) * 60

  const mutationAddHours = useUserAdminActionAddHours()

  const isPending = isMutationPending(ECacheKeys.addHours)

  const { hours: currentHours, minutes: currentMinutes } = secondsToHoursAndMinutes(maxUsageTime)
  const shouldDisplayCurrentMinutes = currentMinutes > 0

  const handleClick = async () => {
    if (!isSure && finalHoursInSeconds === 0) return
    setIsSure(s => !s)

    if (isSure) {
      mutationAddHours.mutate(
        {
          hoursAddingInSeconds: finalHoursInSeconds,
          planId,
          userId,
        },
        {
          onSuccess([undesired, message]) {
            if (undesired) {
              toast[undesired.type](undesired.message)
              return
            }
            toast.success(message)
          },
        }
      )
    }
  }

  const handleHoursOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!/^\d+$/.test(value) && value !== "") return
    const valueUnparsed = value === "" ? 0 : parseInt(e.target.value)
    const [error, hours] = Hours.create(valueUnparsed)
    if (error) return
    setHours(hours.getValue())
  }

  const handleMinutesOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!/^\d+$/.test(value) && value !== "") return
    const valueUnparsed = value === "" ? 0 : parseInt(e.target.value)
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
          <span>{currentHours}h</span>
          {shouldDisplayCurrentMinutes && <span> {currentMinutes}m</span>}
        </Pieces.HeaderSubjectAmount>
      </Pieces.Header>
      <Pieces.Footer>
        <Pieces.Input
          className="w-12"
          value={hours.toString().padStart(2, "0")}
          onChange={handleHoursOnChange}
        />
        <span className="pl-1 pr-2">h</span>
        <Pieces.Input
          className="w-12"
          value={minutes.toString().padStart(2, "0")}
          onChange={handleMinutesOnChange}
        />
        <span className="pl-1 pr-2">min</span>

        {isPending && (
          <Pieces.Loading>
            <IconSpinner
              color={twc.slate["200"]}
              className="size-3 animate-pulse"
            />
          </Pieces.Loading>
        )}
        {!isPending && (
          <Pieces.Trigger onClick={handleClick}>
            {!isSure && <IconPlus className="size-3 text-white" />}
            {isSure && children}
            <HoverCard data-open={isSure}>
              <p>- Máximo de horas -</p>
              <p className="tabular-nums text-sm/none py-1 px-2 rounded-md bg-accent border border-accent-500 mt-1">
                De <strong>{maxUsageTime}</strong> horas para <strong>{hours}</strong> horas{" "}
                {minutes !== "00" && `e ${minutes} minutos`}
              </p>
              <span className="text-xs text-slate-500 mt-1">
                Tem certeza que deseja fazer essa alteração?
              </span>
            </HoverCard>
          </Pieces.Trigger>
        )}
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
