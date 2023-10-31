import { FooterItemLink } from "@/components/layouts/Footer/footer-item-link"
import { cn } from "@/lib/utils"
import React from "react"

export type FooterProps = React.ComponentPropsWithoutRef<"footer"> & {}

export const Footer = React.forwardRef<React.ElementRef<"footer">, FooterProps>(function FooterComponent(
  { className, ...props },
  ref
) {
  return (
    <footer
      {...props}
      className={cn("bg-black", className)}
      ref={ref}
    >
      <div className="flex flex-col sm:flex-row max-w-5xl w-full mx-auto pb-9 px-4 md:px-8">
        <div className="flex-1 pt-9 px-2">
          <div className="pb-4">
            <h2 className="font-semibold text-xl">Navegação</h2>
          </div>
          <div className="flex flex-col">
            <FooterItemLink
              href="/"
              target="_self"
            >
              <span>Home</span>
            </FooterItemLink>
          </div>
        </div>
        <div className="flex-1 pt-9 px-2 hidden sm:flex" />
        <div className="flex-1 pt-9 px-2">
          <div className="pb-4">
            <h2 className="font-semibold text-xl">Entre em contato</h2>
          </div>
          <div className="flex flex-col gap-2">
            <FooterItemLink href="mailto:123456789@mail.com">
              <SVGMail className="scale-[1.15] shrink-0" />
              <span className="">suporte@hourboost.com.br</span>
            </FooterItemLink>
            <FooterItemLink href="https://discord.com/invite/ZMknxzWCBW">
              <SVGDiscord className="shrink-0" />
              <span>Discord</span>
            </FooterItemLink>
          </div>
        </div>
      </div>
    </footer>
  )
})

Footer.displayName = "Footer"

export type SVGMailProps = React.ComponentPropsWithoutRef<"svg">

export function SVGMail({ ...props }: SVGMailProps) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth={0}
      viewBox="0 0 24 24"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20 4H6c-1.103 0-2 .897-2 2v5h2V8l6.4 4.8a1.001 1.001 0 0 0 1.2 0L20 8v9h-8v2h8c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-7 6.75L6.666 6h12.668L13 10.75z" />
      <path d="M2 12h7v2H2zm2 3h6v2H4zm3 3h4v2H7z" />
    </svg>
  )
}

export type SVGDiscordProps = React.ComponentPropsWithoutRef<"svg">

export function SVGDiscord({ ...props }: SVGDiscordProps) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth={0}
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
    </svg>
  )
}
