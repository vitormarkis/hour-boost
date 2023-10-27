import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export type HeaderProps = React.ComponentPropsWithoutRef<"header"> & {}

export const Header = React.forwardRef<React.ElementRef<"header">, HeaderProps>(function HeaderComponent(
  { className, ...props },
  ref
) {
  return (
    <header
      {...props}
      className={cn(
        "relative z-40 flex h-14 items-center border-b border-white/10 bg-black/30 backdrop-blur-sm",
        className
      )}
      ref={ref}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center px-4">
        <div className="flex-1 flex">
          <div className="pr-8">
            <img
              src="logo.png"
              alt=""
              className="h-[1.7rem]"
            />
          </div>
          <ul className="flex gap-2 items-center">
            <li className="px-2 text-slate-300 hover:text-white hover:underline">
              <Link href="#">Como funciona?</Link>
            </li>
            <li className="px-2 text-slate-300 hover:text-white hover:underline">
              <Link href="#">Pacotes</Link>
            </li>
            <li className="px-2 text-slate-300 hover:text-white hover:underline">
              <Link href="#">FAQ</Link>
            </li>
            <li className="px-2 text-slate-300 hover:text-white hover:underline">
              <Link href="#">Suporte</Link>
            </li>
          </ul>
        </div>
        <div>
          <Button
            variant="ghost"
            className="h-full"
          >
            <span>Entrar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 256"
              className="w-4"
            >
              <rect
                width={256}
                height={256}
                fill="none"
              />
              <circle
                cx={128}
                cy={96}
                r={64}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={24}
              />
              <path
                d="M32,216c19.37-33.47,54.55-56,96-56s76.63,22.53,96,56"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={24}
              />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
})

Header.displayName = "Header"
