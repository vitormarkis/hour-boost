import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/router"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ResourceNotFoundPage() {
  const router = useRouter()

  return (
    <div className="relative h-screen flex justify-center items-center overflow-hidden">
      <header className="h-10 z-20 absolute top-0 right-0 left-0 flex items-center">
        <div className="max-w-7xl px-4 md:px-8 w-full flex items-center mx-auto">
          <div className="flex md:hidden flex-1 items-center">
            <div className="relative">
              <div className="absolute inset-0" />
              <button
                onClick={() => router.back()}
                className="relative h-8 w-8 grid place-items-center hover:bg-slate-950/40"
              >
                <SVGArrowLeft className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* <div className="grow flex justify-center items-center">
            <img
              src="logo.png"
              alt=""
              className="h-[1.7rem]"
            />
          </div> */}
          <div className="flex md:hidden flex-1 items-center justify-end">
            <Link
              href="/"
              className="h-8 w-8 grid place-items-center hover:bg-slate-950/40"
            >
              <SVGHome className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>
      <div
        className="-z-10 pointer-events-none"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "70rem",
          height: "37rem",
          WebkitMaskImage: "radial-gradient(black 46%, transparent 68%)",
          opacity: "0.5",
          mixBlendMode: "luminosity",
        }}
      >
        <img
          src="https://images8.alphacoders.com/133/1332612.jpeg"
          style={{
            position: "absolute",
            inset: 0,
            height: "100%",
            width: "100%",
            display: "block",
            objectFit: "cover",
          }}
        />
      </div>
      <div className="relative h-[30rem] w-full max-w-[40rem] flex flex-col">
        <div className="hidden md:flex pb-6 justify-between">
          <Button
            onClick={() => router.back()}
            size="sm"
            className="border border-slate-500 hover:border-white bg-slate-950 hover:bg-black text-slate-200 hover:text-white hover:pl-10 group transition-all duration-200 relative"
          >
            <SVGArrowLeft className="absolute top-1/2 -translate-y-1/2 left-3 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0 translate-x-2" />
            <span>Voltar</span>
          </Button>
          <Button
            onClick={() => router.back()}
            size="sm"
            className="border border-slate-500 hover:border-white bg-slate-950 hover:bg-black text-slate-200 hover:text-white hover:pr-10 group transition-all duration-200 relative"
            asChild
          >
            <Link href="/">
              <SVGArrowLeft className="rotate-180 absolute top-1/2 -translate-y-1/2 right-3 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0 translate-x-2" />
              <span>Home</span>
            </Link>
          </Button>
        </div>
        <div className="grid place-items-center h-full">
          <div className="flex flex-col scale-[0.9] xs:scale-100">
            <div className="relative leading-none h-fit font-extrabold text-[7rem]">
              <div className="flex justify-between">
                {["4", "0", "4"].map((number, index) => (
                  <motion.span
                    key={`${number}-${index}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, ease: "easeInOut" }}
                    className="block pb-4"
                  >
                    {number}
                  </motion.span>
                ))}
              </div>
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="h-1 absolute top-0 w-full bg-white"
              />
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, ease: "easeInOut" }}
              className="leading-none text-slate-300 block font-normal text-[1.5rem]"
            >
              Página não encontrada!
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  )
}

export type SVGArrowLeftProps = React.ComponentPropsWithoutRef<"svg">

export function SVGArrowLeft({ className, ...props }: SVGArrowLeftProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <line
        x1={216}
        y1={128}
        x2={40}
        y2={128}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <polyline
        points="112 56 40 128 112 200"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}

export type SVGHomeProps = React.ComponentPropsWithoutRef<"svg">

export function SVGHome({ className, ...props }: SVGHomeProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <path
        d="M152,208V160a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v48a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V115.54a8,8,0,0,1,2.62-5.92l80-75.54a8,8,0,0,1,10.77,0l80,75.54a8,8,0,0,1,2.62,5.92V208a8,8,0,0,1-8,8H160A8,8,0,0,1,152,208Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}
