import React from "react"
import { cn } from "@/lib/utils"

export type CardAppleRootProps = React.ComponentPropsWithoutRef<"div"> & {
	children: React.ReactNode
}

const CardAppleRoot = React.forwardRef<React.ElementRef<"div">, CardAppleRootProps>(
	function CardAppleRootComponent({ children, className, ...props }, ref) {
		return (
			<div
				{...props}
				className={cn("flex-1 flex flex-col items-center overflow-hidden", className)}
				ref={ref}
			>
				<div className="h-[1px] w-[60%] bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
				<div className="relative flex flex-col items-center w-full">
					<div className="w-[7rem] h-[7rem] absolute left-1/2 -translate-x-1/2 top-0 -translate-y-1/2 bg-slate-500/70 rounded-full blur-[60px]" />
					{children}
				</div>
			</div>
		)
	}
)

CardAppleRoot.displayName = "CardApple"

export type CardAppleTitleProps = React.ComponentPropsWithoutRef<"div"> & {
	children: React.ReactNode
}

const CardAppleTitle = React.forwardRef<React.ElementRef<"div">, CardAppleTitleProps>(
	function CardAppleTitleComponent({ children, className, ...props }, ref) {
		return (
			<div
				{...props}
				className={cn(
					"pt-4 text-lg font-semibold uppercase w-full px-[1.5rem] flex justify-center",
					className
				)}
				ref={ref}
			>
				<h2>{children}</h2>
			</div>
		)
	}
)

CardAppleTitle.displayName = "CardAppleTitle"

export type CardAppleMainAssetProps = React.ComponentPropsWithoutRef<"div"> & {
	maskURL: string
}

const CardAppleMainAsset = React.forwardRef<React.ElementRef<"div">, CardAppleMainAssetProps>(
	function CardAppleMainAssetComponent({ maskURL, className, ...props }, ref) {
		return (
			<div
				{...props}
				className={cn("relative h-[7rem] w-[7rem] mt-4", className)}
				ref={ref}
				style={{
					background: "linear-gradient(-180deg, hsl(var(--accent)) 30%, #213d57 92%)",
					WebkitMaskImage: `url(${maskURL})`,
					maskType: "alpha",
					maskSize: "contain",
					WebkitMaskSize: "contain",
				}}
			/>
		)
	}
)

CardAppleMainAsset.displayName = "CardAppleMainAsset"

export const CardApple = {
	Root: CardAppleRoot,
	Title: CardAppleTitle,
	MainAsset: CardAppleMainAsset,
}
