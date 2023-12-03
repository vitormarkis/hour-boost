import React from "react"
import { TitleSection } from "@/components/atoms/TitleSection"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQData } from "@/components/layouts/FAQSection/FAQData"

export type FAQSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const FAQSection = React.forwardRef<React.ElementRef<"section">, FAQSectionProps>(
	function FAQSectionComponent({ className, ...props }, ref) {
		return (
			<>
				<div className="pt-24" />
				<section
					{...props}
					className={cn("flex flex-col pt-8 pb-72 w-screen grow flex-wrap justify-center gap-6", className)}
					ref={ref}
					id="faq"
				>
					<TitleSection className="text-center grow">FAQ</TitleSection>
					<div className="max-w-7xl w-full mx-auto px-4 md:px-8">
						<div className="max-w-5xl w-full mx-auto">
							<Accordion type="multiple">
								{FAQData.map(faq => (
									<AccordionItem
										key={faq.question.replace(/\s+/g, " ").trim()}
										value={faq.question.replace(/\s+/g, " ").trim()}
									>
										<AccordionTrigger>{faq.question}</AccordionTrigger>
										<AccordionContent>{faq.answer}</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</div>
					</div>
				</section>
			</>
		)
	}
)

FAQSection.displayName = "FAQSection"
