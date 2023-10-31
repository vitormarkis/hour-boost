import React from "react"
import { cn } from "@/lib/utils"

export type CardBulletsSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const CardBulletsSection = React.forwardRef<React.ElementRef<"section">, CardBulletsSectionProps>(
  function CardBulletsSectionComponent({ className, ...props }, ref) {
    return (
      <section
        {...props}
        className={cn("relative overflow-hidden bg-slate-950", className)}
        ref={ref}
      >
        <div className="py-24 bg-white text-slate-900">
          <div className="border-b border-dotted border-slate-300 absolute right-0 left-0 -translate-y-14" />
          <div className="border-b border-dotted border-slate-400 absolute right-0 left-0 -translate-y-8" />

          <div className="relative max-w-7xl w-full flex-col md:flex-row flex grow flex-wrap px-4 md:px-8 mx-auto">
            <div className="border-r border-dotted border-slate-400 absolute translate-y-[-50%] left-0 top-0 bottom-0" />
            <div className="flex-1 flex flex-col pb-6 mb-6 border-b md:border-b-0 md:pb-0 md:mb-0 md:pr-6 md:mr-6 md:border-r border-slate-400 border-dotted">
              <h1 className="text-2xl font-semibold">Aumente suas horas da Steam</h1>
              <p className="text-slate-600">
                Utilize nossos servidores para <strong>farmar</strong> horas na Steam{" "}
                <strong>enquanto você está ausente</strong>. Controle por um painel em{" "}
                <strong>qualquer lugar</strong>.
              </p>
            </div>
            <div className="flex-1 flex flex-col">
              <h1 className="text-2xl font-semibold">Por que aumentar suas horas?</h1>
              <p className="text-slate-600">
                Igualar horas jogadas entre diferentes, farmar cartinhas de jogos na Steam, tornar a conta
                mais única, <strong>destravar conquistas de jogos</strong> da Steam.
              </p>
            </div>
            <div className="border-r border-dotted border-slate-400 absolute translate-y-[50%] right-0 top-0 bottom-0" />
          </div>
          <div className="border-b border-dotted border-slate-300 absolute right-0 left-0 translate-y-14" />
          <div className="border-b border-dotted border-slate-400 absolute right-0 left-0 translate-y-8" />
        </div>
      </section>
    )
  }
)

CardBulletsSection.displayName = "CardBulletsSection"
