import React from "react"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import st from "./pages.module.css"
import { Header } from "@/components/layouts/Header"
import { SVGWhiteDots } from "@/components/svgs/white-dots"
import { GetServerSideProps } from "next"
import { AuthSessionParams } from "@/types/UserSession"
import { getAuthSession } from "@/util/getAuthSession"

export const getServerSideProps: GetServerSideProps = async ctx => {
  const props = await getAuthSession(ctx.req)
  return { props }
}

const images = [
  {
    src: "https://hourboost.com.br/cdn/steam/apps/2319770/header.jpg",
  },
  {
    src: "https://hourboost.com.br/cdn/steam/apps/2055410/header.jpg",
  },
  {
    src: "https://hourboost.com.br/cdn/steam/apps/2330160/header.jpg",
  },
  {
    src: "https://hourboost.com.br/cdn/steam/apps/2350540/header.jpg",
  },
  {
    src: "https://hourboost.com.br/cdn/steam/apps/2357390/header.jpg",
  },
  {
    src: "https://hourboost.com.br/cdn/steam/apps/2212110/header.jpg",
  },
]

export default function Home({ authSession }: AuthSessionParams) {
  return (
    <>
      <Header user={authSession.user} />
      <HeroSection />
      <HowItWorksSection />
      <section className="relative flex w-screen grow flex-wrap gap-6 py-14 bg-slate-900">
        <div className="max-w-7xl w-full mx-auto flex justify-between">
          <div className="flex flex-col absolute top-14">
            <span className="block font-semibold text-[5rem]/none">São mais de</span>
            <span className="block font-black text-[7rem]/none">98.808 jogos</span>
            <span className="block font-semibold text-[4rem]/none">disponíveis!</span>
          </div>
          <div className="h-[34rem] flex flex-col justify-end items-end w-full">
            <div className="pr-32 relative">
              <div className="w-[30rem] z-[15] aspect-video border border-white relative">
                <img
                  src={images[0].src}
                  className="fillimg object-cover"
                  alt=""
                />
              </div>
              <div className="w-[20rem] top-0 left-0 z-10 translate-x-[25rem] translate-y-[5.6rem] skew-x-[-30deg] opacity-10 aspect-video border border-white absolute">
                <img
                  src={images[4].src}
                  className="fillimg object-cover"
                  alt=""
                />
              </div>
              <div className="w-[21rem] top-0 left-0 z-10 translate-x-[20rem] translate-y-[5rem] skew-x-[-30deg] opacity-25 aspect-video border border-white absolute">
                <img
                  src={images[3].src}
                  className="fillimg object-cover"
                  alt=""
                />
              </div>
              <div className="w-[24rem] top-0 left-0 z-10 translate-x-[14rem] translate-y-[3.3rem] skew-x-[-14deg] opacity-50 aspect-video border border-white absolute">
                <img
                  src={images[2].src}
                  className="fillimg object-cover"
                  alt=""
                />
              </div>
              <div className="w-[27rem] top-0 left-0 z-10 translate-x-[8rem] translate-y-[1.7rem] skew-x-[-6deg] opacity-75 aspect-video border border-white absolute">
                <img
                  src={images[1].src}
                  className="fillimg object-cover"
                  alt=""
                />
              </div>
            </div>
            {/* <img
              src={images[1].src}
              className="block border border-white"
              alt=""
            /> */}
          </div>
        </div>
        <div className="w-full h-[900px]"></div>
        <div className={st.divisor}>
          <SVGWhiteDots />
        </div>
      </section>
    </>
  )
}

// {images.map(i => (
//   <div
//     key={i.src}
//     className="relative overflow-hidden basis-[34%] grow w-[34%]"
//   >
//     <div className="relative overflow-hidden">
//       <img
//         src={i.src}
//         alt=""
//         // className="invisible"
//         // className="fillimg"
//       />
//     </div>
//   </div>
// ))}
