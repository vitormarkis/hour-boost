import React from "react"
import { TitleSection } from "@/components/atoms/TitleSection"
import { cn } from "@/lib/utils"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FAQData } from "@/components/layouts/FAQSection/FAQData"
import { ChevronDown } from "lucide-react"

export type FAQSectionProps = React.ComponentPropsWithoutRef<"section"> & {}

export const FAQSection = React.forwardRef<React.ElementRef<"section">, FAQSectionProps>(
  function FAQSectionComponent({ className, ...props }, ref) {
    return (
      <>
        <div className="pt-24" />
        <section
          {...props}
          className={cn("flex w-screen grow flex-col flex-wrap justify-center gap-6 pb-72 pt-8", className)}
          ref={ref}
          id="faq"
        >
          <TitleSection className="grow text-center">FAQ</TitleSection>
          <div className="mx-auto w-full max-w-7xl px-4 md:px-8">
            <div className="mx-auto w-full max-w-5xl">
              <Accordion type="multiple">
                {FAQData.map(faq => (
                  <AccordionItem
                    huedBorder
                    colorScheme="default"
                    key={faq.question.replace(/\s+/g, " ").trim()}
                    value={faq.question.replace(/\s+/g, " ").trim()}
                  >
                    <AccordionTrigger>
                      {faq.question}
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </AccordionContent>
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
