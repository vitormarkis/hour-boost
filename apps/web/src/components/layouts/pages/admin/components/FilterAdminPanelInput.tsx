import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useSetAtom } from "jotai"
import React from "react"
import { filterInputAtom } from "./AdminUserListContent"
import { IconMagnifying } from "@/components/icons/IconMagnifying"

export type FilterAdminPanelInputProps = React.ComponentPropsWithoutRef<"section"> & {
  startTransition: React.TransitionStartFunction
}

export const FilterAdminPanelInput = React.forwardRef<
  React.ElementRef<"section">,
  FilterAdminPanelInputProps
>(function FilterAdminPanelInputComponent({ startTransition, className, ...props }, ref) {
  const setInput = useSetAtom(filterInputAtom)

  return (
    <section
      {...props}
      className={cn("mb-3 flex gap-2", className)}
      ref={ref}
    >
      <label className="relative flex w-[20rem] flex-col">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <IconMagnifying className="h-4 w-4 text-slate-500" />
        </div>
        <Input
          type="text"
          placeholder="Filtre por usuários..."
          onChange={e => {
            startTransition(() => {
              setInput(e.target.value)
            })
          }}
        />
      </label>
    </section>
  )
})

FilterAdminPanelInput.displayName = "FilterAdminPanelInput"
