import React from "react"
import { cn } from "@/lib/utils"

export type TitleSectionProps = React.ComponentPropsWithoutRef<"h1"> & {
	children: React.ReactNode
}

export const TitleSection = React.forwardRef<React.ElementRef<"h1">, TitleSectionProps>(
	function TitleSectionComponent({ children, className, ...props }, ref) {
		return (
			<h1 {...props} className={cn("text-5xl font-semibold text-center", className)} ref={ref}>
				{children}
			</h1>
		)
	}
)

TitleSection.displayName = "TitleSection"
