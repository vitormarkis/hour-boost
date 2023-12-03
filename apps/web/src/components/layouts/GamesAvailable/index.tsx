import React from "react"
import { cn } from "@/lib/utils"
import { ButtonPrimary } from "@/components/theme/button-primary"
import st from "./styles.module.css"
import { SVGWhiteDots } from "@/components/svgs/white-dots"

export type GamesAvailableSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const GamesAvailableSection = React.forwardRef<
	React.ElementRef<"section">,
	GamesAvailableSectionProps
>(function GamesAvailableSectionComponent({ className, ...props }, ref) {
	return (
		<section
			{...props}
			className={cn("relative overflow-hidden flex grow flex-wrap gap-6 bg-slate-950", className)}
			ref={ref}
		>
			<div className="max-w-8xl mx-auto w-full h-full absolute inset-0">
				<div className={cn("absolute inset-0", st.gamesImageFXs)}>
					<img
						src="https://www.techspot.com/articles-info/1429/images/2017-06-25-image.jpg"
						className="fillimg object-cover opacity-80"
					/>
				</div>
			</div>
			<div className="relative pt-14 max-w-7xl w-full mx-auto flex justify-between z-10 px-4 md:px-8">
				<div
					className="absolute h-[1px] left-28 top-0 w-[24rem]"
					style={{
						background:
							"linear-gradient(90deg, transparent, hsla(var(--accent) / 40%), transparent), linear-gradient(90deg, transparent, hsl(0,0%,20%), transparent)",
					}}
				/>
				<div
					className="absolute z-[9] h-[31rem] w-[10rem] bg-[hsl(var(--accent))] saturate-50 blur-[76px] rounded-[100%] opacity-40"
					style={{
						transform: "rotate(28deg) translate(1rem, -14rem)",
					}}
				/>
				<div className="flex flex-col relative z-10">
					<span className="leading-none block font-semibold text-[clamp(1.7rem,_10.7vw,_3.7rem)] md:text-[5rem]">
						São mais de
					</span>
					<span className="leading-none block font-black text-[clamp(2rem,_14.8vw,_5.1rem)] md:text-[7rem]">
						98.808 jogos
					</span>
					<span className="leading-none block font-semibold text-[clamp(1.1rem,_8.9vw,_3rem)] md:text-[4rem]">
						disponíveis!
					</span>
				</div>
			</div>
			<div className="flex w-full relative z-20 gap-20 pt-12 md:pt-20 justify-center">
				<ButtonPrimary colorScheme="cyan-blue">Ver planos</ButtonPrimary>
			</div>
			<div className="w-full h-[18rem] md:h-[27rem]"></div>
			<div className={st.divisor}>
				<SVGWhiteDots />
			</div>
		</section>
	)
})

GamesAvailableSection.displayName = "GamesAvailableSection"
