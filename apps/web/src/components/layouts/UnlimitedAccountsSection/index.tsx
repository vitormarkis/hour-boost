import React from "react"
import { cn } from "@/lib/utils"
import { TitleSection } from "@/components/atoms/TitleSection"

export type UnlimitedAccountsSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const UnlimitedAccountsSection = React.forwardRef<
  React.ElementRef<"section">,
  UnlimitedAccountsSectionProps
>(function UnlimitedAccountsSectionComponent({ className, ...props }, ref) {
  return (
    <section
      {...props}
      className={cn("relative flex grow flex-wrap gap-6 overflow-hidden bg-slate-950 pb-24", className)}
      ref={ref}
    >
      <TitleSection className="grow text-center">Contas Ilimitadas</TitleSection>
    </section>
  )
})

UnlimitedAccountsSection.displayName = "UnlimitedAccountsSection"
