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
      className={cn("flex gap-2 mb-3", className)}
      ref={ref}
    >
      <label className="flex flex-col relative w-[20rem]">
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <IconMagnifying className="w-4 h-4 text-slate-500" />
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
