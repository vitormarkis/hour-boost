import React, { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import st from "./button-primary.module.css"
import { cssVariables } from "@/util/units/cssVariables"

export type ButtonPrimaryProps = React.ComponentPropsWithoutRef<typeof Button> & {
  colorScheme?: keyof typeof buttonPrimaryHueThemes
  children: React.ReactNode
}

export const buttonPrimaryHueThemes = {
  "orange-yellow": [57, 30],
  "purple-blue": [240, 300],
} as const

export const ButtonPrimary = React.forwardRef<React.ElementRef<typeof Button>, ButtonPrimaryProps>(
  function ButtonPrimaryComponent(
    { colorScheme = "orange-yellow", style, children, className, ...props },
    ref
  ) {
    const [appleHue, bananaHue] = buttonPrimaryHueThemes[colorScheme]
    const hues = Object.entries({ appleHue, bananaHue })

    return (
      <Button
        {...props}
        className={cn("px-5 py-0 font-semibold text-white", st.buttonStyles, className)}
        ref={ref}
        style={cssVariables(hues, style)}
      >
        {children}
      </Button>
    )
  }
)

ButtonPrimary.displayName = "ButtonPrimary"
