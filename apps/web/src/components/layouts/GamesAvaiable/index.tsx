import React from "react"
import { cn } from "@/lib/utils"
import { ButtonPrimary } from "@/components/theme/button-primary"
import st from "./pages.module.css"
import { SVGWhiteDots } from "@/components/svgs/white-dots"

export type GamesAvailableSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const GamesAvailableSection = React.forwardRef<
  React.ElementRef<"section">,
  GamesAvailableSectionProps
>(function GamesAvailableSectionComponent({ className, ...props }, ref) {
  return (
    <section
      {...props}
      className={cn("relative overflow-hidden flex grow flex-wrap gap-6 bg-slate-950", className)}
      ref={ref}
    >
      <div className="max-w-8xl mx-auto w-full h-full absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: "linear-gradient(101deg, transparent 43%, black 100%)",
            maskImage: "linear-gradient(101deg, transparent 43%, black 100%)",
          }}
        >
          <img
            src="https://www.techspot.com/articles-info/1429/images/2017-06-25-image.jpg"
            className="fillimg object-cover opacity-80"
          />
        </div>
      </div>
      <div className="relative pt-14 max-w-7xl w-full mx-auto flex justify-between z-10 px-8">
        <div
          className="absolute h-[1px] left-0 top-0 w-[30rem]"
          style={{
            background: "linear-gradient(90deg, transparent, hsla(var(--accent) / 50%), transparent)",
          }}
        ></div>
        <div
          className="absolute z-[9] h-[31rem] w-[10rem] bg-[hsl(var(--accent))] saturate-50 blur-[76px] rounded-[100%] opacity-40"
          style={{
            transform: "rotate(28deg) translate(1rem, -14rem)",
          }}
        />
        <div className="flex flex-col relative z-10">
          <span className="block font-semibold text-[5rem]/none">São mais de</span>
          <span className="block font-black text-[7rem]/none">98.808 jogos</span>
          <span className="block font-semibold text-[4rem]/none">disponíveis!</span>
        </div>
      </div>
      <div className="flex w-full relative z-20 gap-20 pt-20 justify-center">
        <ButtonPrimary colorScheme="purple-blue">Ver planos</ButtonPrimary>
      </div>
      <div className="w-full h-[27rem]"></div>
      <div className={st.divisor}>
        <SVGWhiteDots />
      </div>
    </section>
  )
})

GamesAvailableSection.displayName = "GamesAvailableSection"
