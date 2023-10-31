import { TitleSection } from "@/components/atoms/TitleSection"
import { WhatWeOfferSection } from "@/components/layouts/CardBulletsSection"
import { FAQSection } from "@/components/layouts/FAQSection"
import { Footer } from "@/components/layouts/Footer"
import { GamesAvailableSection } from "@/components/layouts/GamesAvailable"
import { Header } from "@/components/layouts/Header"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import { cn } from "@/lib/utils"
import { AuthSessionParams } from "@/types/UserSession"
import { getAuthSession } from "@/util/getAuthSession"
import { GetServerSideProps } from "next"
import st from "./pages.module.css"
import { PlanSection } from "@/components/layouts/PlansSection"
import { UnlimitedAccountsSection } from "@/components/layouts/UnlimitedAccountsSection"

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
      {/* <UnlimitedAccountsSection /> */}
      {/* <div className={cn("h-[7rem] bg-slate-950", st["shapedividers_com-8155"])} /> */}
      <WhatWeOfferSection />
      {/* <div
        className={cn("h-[7rem]", st["shapedividers_com-8155"])}
        style={{
          transform: "scale(1,-1) matrix(1, 0, 0, 0.3, 0, 0) translateY(8.7rem)",
        }}
      /> */}
      <PlanSection />
      <FAQSection />
      <Footer />
    </>
  )
}
