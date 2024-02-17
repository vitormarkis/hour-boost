import { WhatWeOfferSection } from "@/components/layouts/WhatWeOffer"
import { FAQSection } from "@/components/layouts/FAQSection"
import { Footer } from "@/components/layouts/Footer"
import { GamesAvailableSection } from "@/components/layouts/GamesAvailable"
import { Header } from "@/components/layouts/Header"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import { GetServerSideProps } from "next"
import { PlanSection } from "@/components/layouts/PlansSection"
import { ServerHeaders } from "@/server-fetch/server-headers"
import { getUserSession } from "@/server-fetch/getUserSession"
import { generateNextCommand } from "@/util/generateNextCommand"
import { UserSessionParams } from "@/server-fetch/types"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const serverHeaders = new ServerHeaders(ctx)
  serverHeaders.appendAuthorization()

  const [error, userSessionResponse] = await getUserSession({ headers: ctx.req.headers })
  if (error) throw error
  const { data, headers } = userSessionResponse

  if (headers["set-cookie"]) ctx.res.setHeader("set-cookie", headers["set-cookie"])

  const command = await generateNextCommand({
    subject: {
      user: data?.userSession,
      serverHeaders: serverHeaders.toJSON(),
    },
  })
  return command
}

export default function Home({ user }: UserSessionParams) {
  return (
    <>
      {/* <pre>{JSON.stringify({ user: user ?? "null" }, null, 2)}</pre> */}
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
