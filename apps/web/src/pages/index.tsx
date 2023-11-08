import { WhatWeOfferSection } from "@/components/layouts/WhatWeOffer"
import { FAQSection } from "@/components/layouts/FAQSection"
import { Footer } from "@/components/layouts/Footer"
import { GamesAvailableSection } from "@/components/layouts/GamesAvailable"
import { Header } from "@/components/layouts/Header"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import { GetServerSideProps } from "next"
import { PlanSection } from "@/components/layouts/PlansSection"
import { UserSession } from "core"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const response = await fetch("http://localhost:3309/me", {
    headers: ctx.req.headers as Record<string, string>,
  })
  const user: UserSession | null = await response.json()
  console.log({ user })

  return {
    props: {
      user,
    } as UserSessionParams,
  }
}

export type UserSessionParams = {
  user: UserSession | null
}

export default function Home({ user }: UserSessionParams) {
  return (
    <>
      <pre>{JSON.stringify({ user: user ?? "null" }, null, 2)}</pre>
      <Header user={user} />
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
