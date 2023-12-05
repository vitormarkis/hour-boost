import * as React from "react"

import { tv, VariantProps } from "tailwind-variants"

export const inputVariants = tv(
  {
    base: "flex w-full border bg-slate-900 border-slate-800  text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
      size: {
        regular: "h-10",
      },
    },
    defaultVariants: {
      size: "regular",
    },
  },
  {
    responsiveVariants: true,
  }
)

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & VariantProps<typeof inputVariants> & {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, size, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={inputVariants({ size, className })}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
