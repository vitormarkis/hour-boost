import { motion } from "framer-motion"
import React from "react"
import st from "./page.module.css"

import { cn } from "@/lib/utils"
import { ButtonPrimary } from "@/components/theme/button-primary"

export type HeroSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const HeroSection = React.forwardRef<React.ElementRef<"section">, HeroSectionProps>(
  function HeroSectionComponent({ className, ...props }, ref) {
    return (
      <section
        {...props}
        className={cn("flex w-screen grow flex-wrap justify-center gap-2", className)}
        ref={ref}
      >
        <div className="flex flex-col h-[calc(100vh_-_56px)] grow items-center justify-center ">
          <div
            className="opacity-20 top-0 left-0 right-0 bottom-1/3 absolute"
            style={{
              WebkitMaskImage: "linear-gradient(180deg, black 50%, transparent 99%)",
            }}
          >
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 4 }}
            className="absolute aspect-square w-[40rem] -translate-y-16 bg-black mix-blend-luminosity"
            style={{
              WebkitMaskImage: "radial-gradient(black 53%, transparent 67%)",
              maskImage: "radial-gradient(black 53%, transparent 67%)",
            }}
          >
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1 }}
              src="https://hourboost.com.br/images/home/background.png"
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
            <div className="relative z-10 mx-auto max-w-6xl text-white">
              <motion.h1
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.5,
                  ease: "easeInOut",
                  opacity: {
                    duration: 0.7,
                  },
                  y: {
                    duration: 1,
                  },
                }}
                className="pb-6 text-center text-7xl font-black tracking-[2.4px]"
              >
                <span className={st.titleSpan}>Farme horas na</span>{" "}
                <span className="span-gr-accent">Steam</span>
                <br />
                <span className={st.titleSpan}>24 horas por dia!</span>
              </motion.h1>
              <motion.h2
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  ease: "easeInOut",
                  delay: 1,
                  opacity: {
                    duration: 0.4,
                  },
                  y: {
                    duration: 0.7,
                  },
                }}
                className="text-center text-3xl font-light tracking-[0.5rem] text-zinc-500"
              >
                Começe com 5 horas grátis
              </motion.h2>
            </div>
          </div>
          <div className="flex w-full relative z-20 gap-20 pt-12 justify-center">
            <ButtonPrimary colorScheme="purple-blue">Ver mais</ButtonPrimary>
            <ButtonPrimary colorScheme="purple-blue">Entrar</ButtonPrimary>
          </div>
        </div>
      </section>
    )
  }
)

HeroSection.displayName = "HeroSection"
