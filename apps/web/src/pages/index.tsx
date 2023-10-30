import React from "react"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import { Header } from "@/components/layouts/Header"
import { GetServerSideProps } from "next"
import { AuthSessionParams } from "@/types/UserSession"
import { getAuthSession } from "@/util/getAuthSession"
import { GamesAvailableSection } from "@/components/layouts/GamesAvaiable"
import { TitleSection } from "@/components/atoms/TitleSection"
import st from "./pages.module.css"
import st_footer from "./footer.module.css"
import { cn } from "@/lib/utils"
import { CardBulletsSection } from "@/components/layouts/CardBulletsSection"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQSection } from "@/components/layouts/FAQSection"
import Link from "next/link"
import { cssVariables } from "@/util/units/cssVariables"
import { buttonPrimaryHueThemes } from "@/components/theme/button-primary"
import { Slot } from "@radix-ui/react-slot"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const props = await getAuthSession(ctx.req)
  return { props }
}

export default function Home({ authSession }: AuthSessionParams) {
  return (
    <>
      <Header user={authSession.user} />
      <HeroSection />
      <HowItWorksSection />
      <GamesAvailableSection />
      <section className="pb-24 relative overflow-hidden flex grow flex-wrap gap-6 bg-slate-950">
        <TitleSection className="text-center grow">Contas Ilimitadas</TitleSection>
      </section>
      <div className={cn("h-[7rem] bg-slate-950", st["shapedividers_com-8155"])} />
      <CardBulletsSection />
      <div
        className={cn("h-[7rem]", st["shapedividers_com-8155"])}
        style={{
          transform: "scale(1,-1) matrix(1, 0, 0, 0.3, 0, 0) translateY(8.7rem)",
        }}
      />
      <section className="flex py-32 pb-72 w-screen grow flex-wrap justify-center gap-6">
        <TitleSection className="text-center grow">Planos</TitleSection>
      </section>
      <FAQSection />
      <footer className="bg-black">
        <div className="flex flex-col sm:flex-row max-w-5xl px-8 w-full mx-auto pb-9">
          <div className="flex-1 pt-9 px-2">
            <div className="pb-4">
              <h2 className="font-semibold text-xl">Navegação</h2>
            </div>
            <div className="flex flex-col">
              <FooterItemLink href="/">
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
                <SVGMail className="scale-[1.15] " />
                <span className="">suporte@hourboost.com.br</span>
              </FooterItemLink>
              <FooterItemLink href="https://discord.com/invite/ZMknxzWCBW">
                <SVGDiscord />
                <span>Discord</span>
              </FooterItemLink>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export type SVGDiscordProps = {}

export function SVGDiscord({}: SVGDiscordProps) {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth={0}
      viewBox="0 0 16 16"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z" />
    </svg>
  )
}

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

export type FooterItemLinkProps = React.ComponentPropsWithoutRef<typeof Link> & {
  colorScheme?: keyof typeof buttonPrimaryHueThemes
  children: React.ReactNode
}

export const FooterItemLink = React.forwardRef<React.ElementRef<typeof Link>, FooterItemLinkProps>(
  function FooterItemLinkComponent(
    { colorScheme = "purple-blue", children, target = "_blank", className, ...props },
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
