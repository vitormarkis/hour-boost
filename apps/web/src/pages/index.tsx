import React from "react"
import { HeroSection } from "@/components/layouts/Hero"
import { HowItWorksSection } from "@/components/layouts/HowItWorks"
import { TitleSection } from "@/components/atoms/TitleSection"
import st from "./pages.module.css"
import { Header } from "@/components/layouts/Header"
import { SVGWhiteDots } from "@/components/svgs/white-dots"

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

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <section className="relative flex w-screen grow flex-wrap gap-6 py-14 bg-slate-900">
        <div className="max-w-7xl w-full mx-auto flex justify-between">
          <div className="flex flex-col absolute top-14">
            <span className="block font-semibold text-[5rem]/none">São mais de</span>
            <span className="block font-black text-[7rem]/none">98.808 jogos</span>
            <span className="block font-semibold text-[4rem]/none">disponíveis!</span>
          </div>
          <div></div>
          <div>
            <div className="relative overflow-hidden max-w-[40rem] flex flex-wrap gap-1 p-1 border border-slate-800">
              <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[17rem] h-[20rem] blur-[120px] bg-cyan-500" />
              <div className="absolute top-0 right-10 translate-x-1/2 w-[17rem] h-[13rem] blur-[80px] bg-pink-500" />
              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[18rem] h-[18rem] blur-[80px] bg-pink-500" />
              <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[19rem] h-[23rem] blur-[130px] bg-indigo-500" />
              <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[13rem] h-[13rem] blur-[60px] bg-white/70" />
              {images.map(i => (
                <div
                  key={i.src}
                  className="relative overflow-hidden basis-[34%] grow w-[34%]"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={i.src}
                      alt=""
                      // className="invisible"
                      // className="fillimg"
                    />
                  </div>
                </div>
              ))}
            </div>
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
