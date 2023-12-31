import { motion } from "framer-motion"
import React from "react"
import st from "./page.module.css"

import { cn } from "@/lib/utils"
import { ButtonPrimary } from "@/components/theme/button-primary"
import {
  gamesListAnimation,
  solderAnimation,
  solderAnimationWrapper,
  subtitleAnimations,
  titleAnimations,
} from "@/components/layouts/Hero/animations"

export type HeroSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const HeroSection = React.forwardRef<React.ElementRef<"section">, HeroSectionProps>(
  function HeroSectionComponent({ className, ...props }, ref) {
    return (
      <section
        {...props}
        className={cn("flex grow flex-wrap justify-center gap-2", className)}
        ref={ref}
      >
        <div className="flex flex-col min-h-[calc(100vh_-_56px)] grow items-center justify-center relative">
          <div
            className="opacity-20 top-0 left-0 right-0 bottom-1/3 absolute"
            style={{
              WebkitMaskImage: "linear-gradient(180deg, black 50%, transparent 99%)",
            }}
          >
            <motion.img
              {...gamesListAnimation}
              src="https://www.techspot.com/articles-info/1429/images/2017-06-25-image.jpg"
              style={{
                position: "absolute",
                inset: "0",
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <motion.div
            {...solderAnimationWrapper}
            className="absolute aspect-square w-full max-w-[32rem] md:max-w-[40rem] translate-y-[-10rem] md:-translate-y-16 bg-black mix-blend-luminosity"
            style={{
              WebkitMaskImage: "radial-gradient(black 53%, transparent 67%)",
              maskImage: "radial-gradient(black 53%, transparent 67%)",
            }}
          >
            <motion.img
              {...solderAnimation}
              src="https://files.tecnoblog.net/wp-content/uploads/2021/04/csgo-1060x596.jpg"
              alt=""
              className="fillimg object-cover"
            />
          </motion.div>
          <div className="w-full z-10 relative">
            <div
              className="inset-0 top-[-2.5rem] bottom-[-2.5rem] absolute backdrop-blur-sm bg-black/30"
              style={{
                WebkitMaskImage:
                  "linear-gradient(0deg, transparent 0%, black 30%, black 80%, transparent 100%)",
              }}
            />
            <div className="relative z-10 mx-auto max-w-6xl text-white px-[0.25rem]">
              <motion.h1
                {...titleAnimations}
                className="pb-6 text-center text-[2.75rem]/[90%] xs:text-5xl md:text-7xl font-black tracking-[2.4px]"
              >
                <span className={st.titleSpan}>Farme horas na</span>{" "}
                <span className="span-gr-accent">Steam</span>
                <br />
                <span className={st.titleSpan}>24 horas por dia!</span>
              </motion.h1>
              <motion.h2
                {...subtitleAnimations}
                className="text-center text-xl xs:text-2xl md:text-3xl font-light tracking-[0.1rem] xs:tracking-[0.2rem] md:tracking-[0.4rem] text-zinc-500"
              >
                Começe com 5 horas grátis
              </motion.h2>
            </div>
          </div>
          <div className="flex w-full relative z-20 max-w-[14rem] md:max-w-none md:flex-row md:gap-20 md:pt-12 justify-center flex-col gap-4 pt-16 px-12">
            <ButtonPrimary colorScheme="cyan-blue">Ver mais</ButtonPrimary>
            <ButtonPrimary colorScheme="cyan-blue">Entrar</ButtonPrimary>
          </div>
        </div>
      </section>
    )
  }
)

HeroSection.displayName = "HeroSection"
