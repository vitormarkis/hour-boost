import React from "react"
import { cn } from "@/lib/utils"
import { cssVariables } from "@/util/units/cssVariables"
import { backgroundHueThemes, buttonPrimaryHueThemes } from "@/components/theme/button-primary"
import { TitleSection } from "@/components/atoms/TitleSection"

export type WhatWeOfferSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const WhatWeOfferSection = React.forwardRef<React.ElementRef<"section">, WhatWeOfferSectionProps>(
  function WhatWeOfferSectionComponent({ className, ...props }, ref) {
    const [appleHue, bananaHue] = buttonPrimaryHueThemes["orange-yellow"]
    // const [backgroundHue, backgroundAltHue] = backgroundHueThemes["default"]
    const questionHues = Object.entries({ appleHue: 130, bananaHue: 157 })
    const upHues = Object.entries({ appleHue, bananaHue })
    const stableHues = Object.entries({ appleHue: 152, bananaHue: 177 })
    const bgHues = Object.entries({
      backgroundHue: "#000",
      backgroundAltHue: "#373737",
    })

    return (
      <section
        {...props}
        className={cn("relative overflow-hidden bg-slate-950", className)}
        ref={ref}
        style={cssVariables(bgHues)}
      >
        <div className="flex flex-col justify-center">
          <div className="px-[1.5rem] flex flex-col">
            <div className="flex pb-2 items-center self-center justify-around gap-8">
              <TitleSection>O que nós oferecemos</TitleSection>
            </div>
            <p className="text-slate-400 max-w-md xs:text-center self-center">
              HourBoost é o serviço de aumento de horas mais barato e confiável atualmente no mercado!
            </p>
          </div>
        </div>
        <div className="py-24">
          <div className="relative max-w-7xl w-full justify-evenly items-center md:items-stretch flex-col md:flex-row flex grow flex-wrap px-0 md:px-8 mx-auto gap-8">
            <div className="max-w-full sm:max-w-xs w-full flex-1 bg-slate-900 px-4 sm:px-8 py-8 md:rounded-md flex flex-col">
              <div className="flex justify-center pb-6">
                <div
                  className="relative h-16 w-20 rounded-md bg-slate-800 grid place-items-center neonShadow neonBackground"
                  style={cssVariables(questionHues)}
                >
                  <SVGMoney className="h-10 w-10 text-[hsl(var(--bananaHue),_70%,_56%)]" />
                </div>
              </div>
              <div className="">
                <h1 className="text-2xl font-semibold text-center">Plano Gratuito</h1>
                <p className="text-slate-400">
                  Desfrute do nosso plano gratuito que para novos usuários, temos um bônus especial de 5 horas
                  grátis para que você aproveite ao máximo nossa plataforma.
                </p>
              </div>
            </div>
            <div className="max-w-full sm:max-w-xs w-full flex-1 bg-slate-900 px-4 sm:px-8 py-8 md:rounded-md flex flex-col">
              <div className="flex justify-center pb-6">
                <div
                  className="relative h-16 w-20 rounded-md bg-slate-800 grid place-items-center neonShadow neonBackground"
                  style={cssVariables(upHues)}
                >
                  <SVGStack className="h-10 w-10 text-[hsl(var(--bananaHue),_70%,_56%)]" />
                </div>
              </div>
              <div className="">
                <h1 className="text-2xl font-semibold text-center">Muitos recursos</h1>
                <p className="text-slate-400">
                  Oferecemos muitos e vários recursos, incluindo, entre outros: suporte 2FA, suporte a vários
                  jogos, resposta automática, aceitação automática de solicitações de amizade e muito mais!
                </p>
              </div>
            </div>
            <div className="max-w-full sm:max-w-xs w-full flex-1 bg-slate-900 px-4 sm:px-8 py-8 md:rounded-md flex flex-col">
              <div className="flex justify-center pb-6">
                <div
                  className="relative h-16 w-20 rounded-md bg-slate-800 grid place-items-center neonShadow neonBackground"
                  style={cssVariables(stableHues)}
                >
                  <SVGShieldLock className="h-10 w-10 text-[hsl(var(--bananaHue),_70%,_56%)]" />
                </div>
              </div>
              <div className="">
                <h1 className="text-2xl font-semibold text-center">Serviço estável</h1>
                <p className="text-slate-400">
                  O serviço de aumento de horas de Steam mais confiável e estável que você pode encontrar.
                  Aproveite nossos recursos para potencializar sua experiência na plataforma Steam{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
)

WhatWeOfferSection.displayName = "WhatWeOfferSection"

export type SVGShieldLockProps = React.ComponentPropsWithoutRef<"svg">

export function SVGShieldLock({ className, ...props }: SVGShieldLockProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <path
        d="M40,114.79V56a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8v58.77c0,84.18-71.31,112.07-85.54,116.8a7.54,7.54,0,0,1-4.92,0C111.31,226.86,40,199,40,114.79Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <polyline
        points="88 136 112 160 168 104"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export type SVGStackProps = React.ComponentPropsWithoutRef<"svg">

export function SVGStack({ className, ...props }: SVGStackProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <polyline
        points="32 176 128 232 224 176"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <polyline
        points="32 128 128 184 224 128"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <polygon
        points="32 80 128 136 224 80 128 24 32 80"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export type SVGMoneyProps = React.ComponentPropsWithoutRef<"svg">

export function SVGMoney({ className, ...props }: SVGMoneyProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <rect
        x={16}
        y={64}
        width={224}
        height={128}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M240,112a48,48,0,0,1-48-48"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <circle
        cx={128}
        cy={128}
        r={28}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M64,64a48,48,0,0,1-48,48"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M192,192a48,48,0,0,1,48-48"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M16,144a48,48,0,0,1,48,48"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export type SVGClockProps = React.ComponentPropsWithoutRef<"svg">

export function SVGClock({ ...props }: SVGClockProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <polyline
        points="128 80 128 128 168 152"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <polyline
        points="184 104 224 104 224 64"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M188.4,192a88,88,0,1,1,1.83-126.23C202,77.69,211.72,88.93,224,104"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export type SVGUpProps = React.ComponentPropsWithoutRef<"svg">

export function SVGUp({ className, ...props }: SVGUpProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <line
        x1={128}
        y1={216}
        x2={128}
        y2={40}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <polyline
        points="56 112 128 40 200 112"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export type SVGQuestionMarkProps = React.ComponentPropsWithoutRef<"svg">

export function SVGQuestionMark({ className, ...props }: SVGQuestionMarkProps) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth={0}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={cn("scale-[1.1]", className)}
    >
      <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
    </svg>
  )
}
