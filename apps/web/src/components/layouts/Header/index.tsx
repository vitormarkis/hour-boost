import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AuthSession } from "@/types/UserSession"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ButtonPrimary } from "@/components/theme/button-primary"
import { MenuDropdownUserHeader } from "@/components/molecules/menu-dropdown-user-header"
import { SheetHeaderNavbar } from "@/components/molecules/sheet-header-navbar"

export type HeaderProps = React.ComponentPropsWithoutRef<"header"> & {
  user: AuthSession["user"]
}

export const Header = React.forwardRef<React.ElementRef<"header">, HeaderProps>(function HeaderComponent(
  { user, className, ...props },
  ref
) {
  return (
    <header
      {...props}
      className={cn(
        "relative py-3 z-40 flex h-14 items-center border-b border-white/10 bg-black/30 backdrop-blur-sm",
        className
      )}
      ref={ref}
    >
      <div className="h-full mx-auto flex w-full max-w-7xl items-center px-4">
        <div className="flex-1 flex md:hidden">
          <SheetHeaderNavbar>
            <SVGList className="h-7 w-7 aspect-square cursor-pointer" />
          </SheetHeaderNavbar>
        </div>
        <div className="flex-1 flex h-full justify-center md:justify-start">
          <div className="shrink-0 flex items-center">
            <img
              src="logo.png"
              alt=""
              className="h-[1.7rem]"
            />
          </div>
          <ul className="hidden md:flex gap-2 items-center pl-8">
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
        <div className="h-full flex flex-1 md:flex-initial justify-end">
          {user && user.firstName && user.lastName && (
            <div className="h-full flex gap-4 items-center">
              <Button
                variant="ghost"
                className="h-full hidden md:flex"
                asChild
              >
                <a href="/dashboard">Ir para Dashboard</a>
              </Button>
              <MenuDropdownUserHeader>
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user.imageUrl} />
                  <AvatarFallback>{user.firstName.at(0)! + user.lastName.at(0)!}</AvatarFallback>
                </Avatar>
              </MenuDropdownUserHeader>
            </div>
          )}
          {!user && (
            <>
              <Button
                variant="ghost"
                className="h-full hidden sm:flex"
                asChild
              >
                <a href="/sign-in">
                  <span>Entrar</span>
                  <SVGUser />
                </a>
              </Button>
              <a
                href="/sign-in"
                className="overflow-hidden grid place-items-center sm:hidden"
              >
                <SVGUser className="h-7 w-7 aspect-square scale-[0.925]" />
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
})

Header.displayName = "Header"

export type SVGUserProps = React.ComponentPropsWithoutRef<"svg">

export function SVGUser({ className, ...props }: SVGUserProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("w-4", className)}
      {...props}
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
  )
}

export type SVGListProps = React.ComponentPropsWithoutRef<"svg">

export function SVGList({ ...props }: SVGListProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      {...props}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <line
        x1={40}
        y1={128}
        x2={216}
        y2={128}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <line
        x1={40}
        y1={64}
        x2={216}
        y2={64}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <line
        x1={40}
        y1={192}
        x2={216}
        y2={192}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}
