import React from "react"
import { cn } from "@/lib/utils"

export type HeaderStructureProps = React.ComponentPropsWithoutRef<"div"> & {
	children: React.ReactNode
}

export const HeaderStructure = React.forwardRef<React.ElementRef<"div">, HeaderStructureProps>(
	function HeaderStructureComponent({ children, className, ...props }, ref) {
		return (
			<header className="relative py-3 z-40 flex h-14 items-center border-b border-white/10 bg-black/30 backdrop-blur-sm">
				<div
					className={cn("h-full mx-auto flex w-full max-w-7xl items-center px-4", className)}
					{...props}
					ref={ref}
				>
					{children}
				</div>
			</header>
		)
	}
)

HeaderStructure.displayName = "HeaderStructure"
