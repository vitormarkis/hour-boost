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
      className={cn("pb-24 relative overflow-hidden flex grow flex-wrap gap-6 bg-slate-950", className)}
      ref={ref}
    >
      <TitleSection className="text-center grow">Contas Ilimitadas</TitleSection>
    </section>
  )
})

UnlimitedAccountsSection.displayName = "UnlimitedAccountsSection"
