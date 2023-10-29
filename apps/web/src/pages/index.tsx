import React from "react"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import { Header } from "@/components/layouts/Header"
import { GetServerSideProps } from "next"
import { AuthSessionParams } from "@/types/UserSession"
import { getAuthSession } from "@/util/getAuthSession"
import { GamesAvailableSection } from "@/components/layouts/GamesAvaiable"

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
    </>
  )
}
