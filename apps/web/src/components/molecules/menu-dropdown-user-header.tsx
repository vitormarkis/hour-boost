import React from "react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useClerk } from "@clerk/clerk-react"
import { useRouter } from "next/navigation"

export type MenuDropdownUserHeaderProps = React.ComponentPropsWithoutRef<typeof DropdownMenuContent> & {
  children: React.ReactNode
}

export const MenuDropdownUserHeader = React.forwardRef<
  React.ElementRef<typeof DropdownMenuContent>,
  MenuDropdownUserHeaderProps
>(function MenuDropdownUserHeaderComponent({ children, className, ...props }, ref) {
  const { signOut } = useClerk()
  const router = useRouter()

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
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

MenuDropdownUserHeader.displayName = "MenuDropdownUserHeader"
