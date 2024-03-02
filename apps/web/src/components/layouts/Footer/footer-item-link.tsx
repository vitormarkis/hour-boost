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
          "group relative flex h-9 items-center gap-4 rounded-md px-4 text-slate-400 hover:text-white [&>*]:transition-all [&>*]:duration-200",
          className
        )}
        ref={ref}
      >
        <div
          className={cn(
            "absolute left-1/2 top-full h-[1px] w-[50%] translate-x-[-50%] opacity-0 group-hover:w-full group-hover:opacity-100",
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
