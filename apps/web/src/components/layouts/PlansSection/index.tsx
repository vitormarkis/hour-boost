import React from "react"
import { cn } from "@/lib/utils"
import { TitleSection } from "@/components/atoms/TitleSection"

export type PlanSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const PlanSection = React.forwardRef<React.ElementRef<"section">, PlanSectionProps>(
  function PlanSectionComponent({ className, ...props }, ref) {
    return (
      <section
        {...props}
        className={cn("flex py-32 pb-72 w-screen grow flex-wrap justify-center gap-6", className)}
        ref={ref}
      >
        <TitleSection className="text-center grow">Planos</TitleSection>
      </section>
    )
  }
)

PlanSection.displayName = "PlanSection"
