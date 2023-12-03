import React from "react"
import { cn } from "@/lib/utils"
import { CardApple } from "@/components/cards/CardApple"
import { TitleSection } from "@/components/atoms/TitleSection"
import { Button } from "@/components/ui/button"
import { ButtonPrimary } from "@/components/theme/button-primary"

export type HowItWorksSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const HowItWorksSection = React.forwardRef<React.ElementRef<"section">, HowItWorksSectionProps>(
	function HowItWorksSectionComponent({ className, ...props }, ref) {
		return (
			<>
				<div className="pt-24" />
				<section
					{...props}
					className={cn("flex py-8 pb-72 w-screen grow flex-wrap justify-center gap-6", className)}
					ref={ref}
					id="how-it-works"
				>
					<div className="flex flex-col w-full">
						<div className="mx-auto flex flex-col">
							<div className="px-[1.5rem]">
								<div className="flex pb-2 items-center self-center justify-around gap-8">
									<div className="hidden md:block w-12 border-b border-white" />
									<TitleSection>Como funciona</TitleSection>
									<div className="hidden md:block w-12 border-b border-white" />
								</div>
								<p className="text-slate-400 max-w-md xs:text-center self-center">
									Faça seu cadastro, adicione horas a sua conta, adicione quantas contas da steam quiser,
									selecione os jogos e inicie o farm
								</p>
							</div>
						</div>
						<div className="pt-12">
							<div className="w-full overflow-hidden">
								<div className="flex flex-col md:flex-row gap-24 md:gap-0 justify-between w-full mx-auto max-w-6xl">
									<CardApple.Root>
										<CardApple.Title>1. Faça login</CardApple.Title>
										<CardApple.MainAsset maskURL="https://cdn-icons-png.flaticon.com/512/4289/4289598.png" />
									</CardApple.Root>
									<CardApple.Root>
										<CardApple.Title>2. Escolha os jogos para o Farm</CardApple.Title>
										<CardApple.MainAsset maskURL="https://cdn-icons-png.flaticon.com/512/12020/12020101.png" />
									</CardApple.Root>
									<CardApple.Root>
										<CardApple.Title>3. Inicie o Farm</CardApple.Title>
										<CardApple.MainAsset maskURL="https://cdn-icons-png.flaticon.com/512/3670/3670382.png" />
									</CardApple.Root>
								</div>
							</div>
						</div>
						<div className="pt-24 flex justify-center">
							<ButtonPrimary colorScheme="cyan-blue">Ver planos</ButtonPrimary>
						</div>
					</div>
				</section>
			</>
		)
	}
)

HowItWorksSection.displayName = "HowItWorksSection"
