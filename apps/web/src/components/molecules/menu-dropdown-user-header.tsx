import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { useClerk } from "@clerk/clerk-react"
import { useRouter } from "next/router"
import React from "react"

export type MenuDropdownUserHeaderProps = React.ComponentPropsWithoutRef<typeof DropdownMenuContent> & {
  children: React.ReactNode
}

export const MenuDropdownUserHeader = React.forwardRef<
  React.ElementRef<typeof DropdownMenuContent>,
  MenuDropdownUserHeaderProps
>(function MenuDropdownUserHeaderComponent({ children, className, ...props }, ref) {
  const { signOut } = useClerk()
  const router = useRouter()
  const userRole = useUser(user => user.role)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        {...props}
        className={cn("", className)}
        ref={ref}
        align="end"
      >
        {/* <DropdownMenuLabel />
        <DropdownMenuSeparator /> */}
        <DropdownMenuItem
          className="focus:bg-red-500"
          onClick={async () => {
            await signOut()
            router.push("/sign-in")
          }}
        >
          Sair
        </DropdownMenuItem>
        {userRole === "ADMIN" && !router.pathname.includes("/admin") && (
          <DropdownMenuItem
            className="focus:bg-accent focus:text-white"
            onClick={async () => {
              router.push("/admin")
            }}
          >
            Painel Admin
          </DropdownMenuItem>
        )}
        {router.pathname.includes("/admin") && (
          <DropdownMenuItem
            className="focus:bg-accent focus:text-white"
            onClick={async () => {
              router.push("/dashboard")
            }}
          >
            Dashboard
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

MenuDropdownUserHeader.displayName = "MenuDropdownUserHeader"
