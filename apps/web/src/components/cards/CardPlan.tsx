import React, { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Slot } from "@radix-ui/react-slot"
import { buttonPrimaryHueThemes } from "@/components/theme/button-primary"
import { cssVariables } from "@/util/units/cssVariables"
import st from "./CardPlan.module.css"

export type CardPlanProps = React.ComponentPropsWithoutRef<typeof CardPlanRoot> & {
  children: React.ReactNode
}

export const CardPlanX = React.forwardRef<React.ElementRef<typeof CardPlanRoot>, CardPlanProps>(
  function CardPlanComponent({ children, className, ...props }, ref) {
    return (
      <CardPlan.Root
        {...props}
        ref={ref}
      >
        <CardPlan.BackgroundBlob />
        <CardPlan.Name>Premium</CardPlan.Name>
        <CardPlan.Price>12</CardPlan.Price>
        <CardPlan.FeaturesContainer className="pt-20">
          <CardPlan.BulletItem weight="strong">24 horas</CardPlan.BulletItem>
          <CardPlan.BulletItem>1 conta da Steam</CardPlan.BulletItem>
          <CardPlan.BulletItem>1 conta por jogo</CardPlan.BulletItem>
          <CardPlan.BulletItem>Farm 24/7</CardPlan.BulletItem>
          <CardPlan.BulletItem>Auto-restar</CardPlan.BulletItem>
        </CardPlan.FeaturesContainer>
        <CardPlan.Button>Testar agora</CardPlan.Button>
      </CardPlan.Root>
    )
  }
)

// CardPlan.displayName = "CardPlan"

export type CardPlanRootProps = React.ComponentPropsWithoutRef<"article"> & {
  children: React.ReactNode
  highlight?: React.ReactNode
}

export const CardPlanRoot = React.forwardRef<React.ElementRef<"article">, CardPlanRootProps>(
  function CardPlanRootComponent({ highlight = null, children, className, ...props }, ref) {
    return (
      <article
        {...props}
        className={cn(
          "relative max-w-[25rem] mdx:max-w-xs w-full flex flex-col bg-slate-900 [&_strong]:font-semibold [&_strong]:text-white",
          className
        )}
        ref={ref}
      >
        {highlight}
        <div className="overflow-hidden relative p-8">{children}</div>
      </article>
    )
  }
)

CardPlanRoot.displayName = "CardPlanRoot"

export type CardPlanHighlightProps = React.ComponentPropsWithoutRef<"div"> & {
  children?: React.ReactNode
  colorScheme?: keyof typeof buttonPrimaryHueThemes
}

export const CardPlanHighlight = React.forwardRef<React.ElementRef<"div">, CardPlanHighlightProps>(
  function CardPlanHighlightComponent(
    { colorScheme = "default", style, children, className, ...props },
    ref
  ) {
    const [appleHue, bananaHue] = buttonPrimaryHueThemes[colorScheme]
    const hues = Object.entries({ appleHue, bananaHue })

    return (
      <div
        {...props}
        className={cn(
          "absolute top-0 right-0 translate-y-[-50%] translate-x-4 z-10 bg-black text-white leading-none py-1.5 px-4 text-sm",
          st.highlight,
          className
        )}
        style={cssVariables(hues, style)}
        ref={ref}
      >
        {children ?? "Mais popular"}
      </div>
    )
  }
)

CardPlanHighlight.displayName = "CardPlanHighlight"

export type CardPlanBackgroundBlobProps = React.ComponentPropsWithoutRef<"div"> & {}

export const CardPlanBackgroundBlob = React.forwardRef<React.ElementRef<"div">, CardPlanBackgroundBlobProps>(
  function CardPlanBackgroundBlobComponent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn(
          "aspect-square rounded-full absolute w-[80rem] h-[80rem] translate-y-[-69.7rem] translate-x-[-29rem] bg-[hsl(222.22deg_18.37%_18.18%)]",
          className
        )}
        ref={ref}
      />
    )
  }
)

CardPlanBackgroundBlob.displayName = "CardPlanBackgroundBlob"

export type CardPlanButtonProps = React.ComponentPropsWithoutRef<typeof Button> & {
  asChild?: boolean
  children: React.ReactNode
}

export const CardPlanButton = React.forwardRef<React.ElementRef<typeof Button>, CardPlanButtonProps>(
  function CardPlanButtonComponent({ asChild, children, className, ...props }, ref) {
    const Component = asChild ? Slot : Button

    return (
      <div className="pt-10 flex justify-center">
        <Component
          {...props}
          className={cn("", className)}
          ref={ref}
        >
          {children}
        </Component>
      </div>
    )
  }
)

CardPlanButton.displayName = "CardPlanButton"

export type CardPlanNameProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

export const CardPlanName = React.forwardRef<React.ElementRef<"div">, CardPlanNameProps>(
  function CardPlanNameComponent({ children, className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("relative pb-4", className)}
        ref={ref}
      >
        <h2 className="font-semibold text-4xl">{children}</h2>
      </div>
    )
  }
)

CardPlanName.displayName = "CardPlanName"

export type CardPlanPriceProps = React.ComponentPropsWithoutRef<"div"> & {
  children: React.ReactNode
}

export const CardPlanPrice = React.forwardRef<React.ElementRef<"div">, CardPlanPriceProps>(
  function CardPlanPriceComponent({ children, className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("flex justify-center", className)}
        ref={ref}
      >
        <div className="w-fit relative">
          <span className="text absolute right-full top-2 translate-x-[-2px]">R$</span>
          <span className="text-7xl font-bold leading-none">{children}</span>
          <span className="text absolute bottom-0 left-full">/mês</span>
        </div>
      </div>
    )
  }
)

CardPlanPrice.displayName = "CardPlanPrice"

export type CardPlanFeaturesContainerProps = React.ComponentPropsWithoutRef<"section"> & {
  children: React.ReactNode
}

export const CardPlanFeaturesContainer = React.forwardRef<
  React.ElementRef<"section">,
  CardPlanFeaturesContainerProps
>(function CardPlanFeaturesContainerComponent({ children, className, ...props }, ref) {
  return (
    <section
      {...props}
      className={cn("relative", className)}
      ref={ref}
    >
      <ul className="flex flex-col gap-4">{children}</ul>
    </section>
  )
})

CardPlanFeaturesContainer.displayName = "CardPlanFeaturesContainer"

export type CardPlanBulletItemProps = React.ComponentPropsWithoutRef<"li"> & {
  weight?: "strong" | "normal" | "weak"
  children: React.ReactNode
}

export const CardPlanBulletItem = React.forwardRef<React.ElementRef<"li">, CardPlanBulletItemProps>(
  function CardPlanBulletItemComponent({ weight = "normal", children, className, ...props }, ref) {
    return (
      <li
        {...props}
        className={cn(
          "flex items-center gap-3",
          {
            "text-slate-500": weight === "weak",
            "text-slate-400": weight === "normal",
            "text-slate-200": weight === "strong",
          },
          className
        )}
        ref={ref}
      >
        <SVGCheckIcon
          className={cn({
            "text-slate-500 h-4 w-4": weight === "weak",
            "text-slate-400 h-4 w-4": weight === "normal",
            "text-green-500 h-5 w-5": weight === "strong",
          })}
        />
        <span
          className={cn({
            "uppercase text-xl font-medium": weight === "strong",
            "line-through": weight === "weak",
          })}
        >
          {children}
        </span>
      </li>
    )
  }
)

CardPlanBulletItem.displayName = "CardPlanBulletItem"

export type SVGCheckIconProps = React.ComponentPropsWithoutRef<"svg">

export function SVGCheckIcon({ ...props }: SVGCheckIconProps) {
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
        points="88 136 112 160 168 104"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <circle
        cx={128}
        cy={128}
        r={96}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export const CardPlan = {
  Root: CardPlanRoot,
  Highlight: CardPlanHighlight,
  BackgroundBlob: CardPlanBackgroundBlob,
  Name: CardPlanName,
  Price: CardPlanPrice,
  FeaturesContainer: CardPlanFeaturesContainer,
  BulletItem: CardPlanBulletItem,
  Button: CardPlanButton,
}
