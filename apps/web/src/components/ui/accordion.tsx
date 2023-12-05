import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { cssVariables } from "@/util/units/cssVariables"

import { cn } from "@/lib/utils"
import st from "./accordion.module.css"
import { buttonPrimaryHueThemes } from "@/components/theme/button-primary"

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
    colorScheme?: keyof typeof buttonPrimaryHueThemes
  }
>(({ colorScheme = "default", style, children, className, ...props }, ref) => {
  const [appleHue, bananaHue] = buttonPrimaryHueThemes[colorScheme]
  const hues = Object.entries({ appleHue, bananaHue })
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn("relative", className, st.shadowEffect)}
      {...props}
    >
      {children}
      <i
        className={cn("absolute h-[1px] top-full right-0 left-0")}
        style={cssVariables(hues, style)}
      />
    </AccordionPrimitive.Item>
  )
})
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-lg md:text-xl text-left font-medium transition-all [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-slate-400 transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = AccordionPrimitive.Content.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
