import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitives.Root>,
	React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
		size?: `${number}rem`
	}
>(({ size = "1.5rem", className, ...props }, ref) => (
	<SwitchPrimitives.Root
		className={cn(
			"peer inline-flex h-[var(--size)] w-[calc((var(--size)*2)-0.25rem)] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-700",
			className
		)}
		{...props}
		ref={ref}
		style={
			{
				"--size": size,
			} as React.CSSProperties
		}
	>
		<SwitchPrimitives.Thumb
			className={cn(
				"pointer-events-none block h-[calc(var(--size)-0.25rem)] w-[calc(var(--size)-0.25rem)] rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[calc(var(--size)-0.25rem)] data-[state=unchecked]:translate-x-0"
			)}
		/>
	</SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
