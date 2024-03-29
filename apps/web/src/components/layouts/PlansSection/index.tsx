import React from "react"
import { cn } from "@/lib/utils"
import { TitleSection } from "@/components/atoms/TitleSection"
import { Button } from "@/components/ui/button"
import { CardPlan as CP, CardPlanHighlight } from "@/components/cards/CardPlan"
import { ButtonPrimary } from "@/components/theme/button-primary"

export type PlanSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const PlanSection = React.forwardRef<React.ElementRef<"section">, PlanSectionProps>(
  function PlanSectionComponent({ className, ...props }, ref) {
    return (
      <section
        {...props}
        className={cn("flex w-screen grow flex-wrap justify-center gap-6 py-32 pb-72", className)}
        ref={ref}
      >
        <TitleSection className="grow pb-[4rem] text-center">Planos</TitleSection>
        <div
          className="w-full pt-16"
          id="plans"
        >
          <div className="mdx:flex-row mx-auto flex h-full w-full max-w-7xl flex-col items-center gap-16 px-4 md:justify-evenly md:gap-8 md:px-8">
            <CP.Root>
              <CP.BackgroundBlob />
              <CP.Name>Grátis</CP.Name>
              <CP.Price>0</CP.Price>
              <CP.FeaturesContainer className="pt-20">
                <CP.BulletItem weight="strong">6 horas</CP.BulletItem>
                <CP.BulletItem>1 conta da Steam</CP.BulletItem>
                <CP.BulletItem>1 jogo por conta</CP.BulletItem>
                <CP.BulletItem weight="weak">Farm 24/7</CP.BulletItem>
                <CP.BulletItem weight="weak">Auto-restart</CP.BulletItem>
              </CP.FeaturesContainer>
              <CP.Button>Testar agora</CP.Button>
            </CP.Root>
            <CP.Root>
              <CP.BackgroundBlob className="bg-slate-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mdx:translate-x-4 -translate-y-24 translate-x-4 rotate-[-7deg]"
                  viewBox="0 0 256 256"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "4rem",
                    height: "4rem",
                    left: "50%",
                    color: "#c3d0e3",
                  }}
                >
                  <rect
                    width={256}
                    height={256}
                    fill="none"
                  />
                  <circle
                    cx={128}
                    cy={184}
                    r={40}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                  <path
                    d="M128,144l82.72-37.6A9,9,0,0,0,216,98.2V49a9,9,0,0,0-9-9H49a9,9,0,0,0-9,9V98.2a9,9,0,0,0,5.28,8.2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                  <line
                    x1={168}
                    y1={40}
                    x2={168}
                    y2="125.82"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                  <line
                    x1={88}
                    y1={40}
                    x2={88}
                    y2="125.82"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                </svg>
              </CP.BackgroundBlob>
              <CP.Name>Silver</CP.Name>
              <CP.Price>12</CP.Price>
              <CP.FeaturesContainer className="pt-20">
                <CP.BulletItem weight="strong">24 horas</CP.BulletItem>
                <CP.BulletItem>1 conta da Steam</CP.BulletItem>
                <CP.BulletItem>1 jogo por conta</CP.BulletItem>
                <CP.BulletItem>Farm 24/7</CP.BulletItem>
                <CP.BulletItem>Auto-restart</CP.BulletItem>
              </CP.FeaturesContainer>
              <CP.Button>Assinar agora</CP.Button>
            </CP.Root>
            <CP.Root
              highlight={<CardPlanHighlight className="-translate-x-4 sm:translate-x-4" />}
              className="mdx:scale-[1.1]"
            >
              <CP.BackgroundBlob className="bg-amber-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  className="mdx:translate-x-[-1.7rem] translate-x-[0.9rem] translate-y-[-6.5rem] rotate-[28deg] scale-[1.8]"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    width: "2rem",
                    height: "2rem",
                    left: "50%",
                    color: "#ffc932",
                  }}
                >
                  <rect
                    width={256}
                    height={256}
                    fill="none"
                  />
                  <path
                    d="M53.22,200S80,184,128,184s74.78,16,74.78,16l37-113.39a4.09,4.09,0,0,0-5.71-5l-53.43,26.64a4.12,4.12,0,0,1-5.35-1.56L131.52,34a4.1,4.1,0,0,0-7,0L80.71,106.72a4.11,4.11,0,0,1-5.36,1.56L22,81.66a4.1,4.1,0,0,0-5.72,5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                </svg>
              </CP.BackgroundBlob>
              <CP.Name>Gold</CP.Name>
              <CP.Price>18</CP.Price>
              <CP.FeaturesContainer className="pt-20">
                <CP.BulletItem weight="strong">24 horas</CP.BulletItem>
                <CP.BulletItem>1 conta da Steam</CP.BulletItem>
                <CP.BulletItem>
                  <strong>32</strong> jogos por conta
                </CP.BulletItem>
                <CP.BulletItem>Farm 24/7</CP.BulletItem>
                <CP.BulletItem>Auto-restart</CP.BulletItem>
              </CP.FeaturesContainer>
              <CP.Button asChild>
                <ButtonPrimary>Assinar agora</ButtonPrimary>
              </CP.Button>
            </CP.Root>
            <CP.Root>
              <CP.BackgroundBlob className="bg-sky-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 256"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    width: "2rem",
                    height: "2rem",
                    left: "50%",
                    color: "#60f8ff",
                    transform: "translate(1.3rem, -7.5rem) rotate(-9deg) scale(2.1)",
                  }}
                >
                  <rect
                    width={256}
                    height={256}
                    fill="none"
                  />
                  <polygon
                    points="72 40 184 40 240 104 128 224 16 104 72 40"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                  <polygon
                    points="176 104 128 224 80 104 128 40 176 104"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                  <line
                    x1={16}
                    y1={104}
                    x2={240}
                    y2={104}
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={24}
                  />
                </svg>
              </CP.BackgroundBlob>
              <CP.Name>Diamond</CP.Name>
              <CP.Price>22</CP.Price>
              <CP.FeaturesContainer className="pt-20">
                <CP.BulletItem weight="strong">24 horas</CP.BulletItem>
                <CP.BulletItem>
                  <strong>2</strong> contas da Steam
                </CP.BulletItem>
                <CP.BulletItem>
                  <strong>32</strong> jogos por conta
                </CP.BulletItem>
                <CP.BulletItem>Farm 24/7</CP.BulletItem>
                <CP.BulletItem>Auto-restart</CP.BulletItem>
              </CP.FeaturesContainer>
              <CP.Button>Assinar agora</CP.Button>
            </CP.Root>
          </div>
        </div>
      </section>
    )
  }
)

PlanSection.displayName = "PlanSection"
