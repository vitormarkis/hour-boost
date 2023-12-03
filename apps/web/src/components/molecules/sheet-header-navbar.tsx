import React from "react"
import { cn } from "@/lib/utils"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { FooterItemLink } from "@/components/layouts/Footer/footer-item-link"

export type SheetHeaderNavbarProps = React.ComponentPropsWithoutRef<"div"> & {
	children: React.ReactNode
}

export const SheetHeaderNavbar = React.forwardRef<React.ElementRef<"div">, SheetHeaderNavbarProps>(
	function SheetHeaderNavbarComponent({ children, className, ...props }, ref) {
		return (
			<Sheet>
				<SheetTrigger asChild>{children}</SheetTrigger>
				<SheetContent {...props} className={cn("border-slate-600", className)} ref={ref} side="left">
					<SheetHeader>
						<SheetTitle>Navegação</SheetTitle>
						{/* <SheetDescription>
              This action cannot be undone. This will permanently delete your account and remove your data
              from our servers.
            </SheetDescription> */}
						<div className="flex flex-col gap-2">
							<FooterItemLink href="/" target="_self">
								Home
							</FooterItemLink>
						</div>
					</SheetHeader>
				</SheetContent>
			</Sheet>
		)
	}
)

SheetHeaderNavbar.displayName = "SheetHeaderNavbar"
