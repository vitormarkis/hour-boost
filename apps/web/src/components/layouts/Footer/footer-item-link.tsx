import { buttonPrimaryHueThemes } from "@/components/theme/button-primary"
import { cn } from "@/lib/utils"
import { cssVariables } from "@/util/units/cssVariables"
import Link from "next/link"
import React from "react"
import st_footer from "./footer.module.css"

export type FooterItemLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  colorScheme?: keyof typeof buttonPrimaryHueThemes
  children: React.ReactNode
}

export const FooterItemLink = React.forwardRef<React.ElementRef<typeof Link>, FooterItemLinkProps>(
  function FooterItemLinkComponent(
    { colorScheme = "default", children, target = "_blank", className, ...props },
    ref
  ) {
    const [appleHue, bananaHue] = buttonPrimaryHueThemes[colorScheme]
    const hues = Object.entries({ appleHue, bananaHue })

    return (
      <Link
        {...props}
        target={target}
        className={cn(
          "relative h-9 px-4 flex items-center rounded-md gap-4 group [&>*]:transition-all [&>*]:duration-200 text-slate-400 hover:text-white",
          className
        )}
        ref={ref}
      >
        <div
          className={cn(
            "group-hover:w-full group-hover:opacity-100 opacity-0 w-[50%] absolute top-full left-1/2 translate-x-[-50%] h-[1px]",
            st_footer.shadowEffect
          )}
          style={cssVariables(hues)}
        />
        {children}
      </Link>
    )
  }
)

FooterItemLink.displayName = "FooterItemLink"
