import React from "react"
import { tv, VariantProps } from "tailwind-variants"

export const inputVariants = tv({
  base: "flex w-full border bg-slate-900 border-slate-800 text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    scale: {
      sm: "h-8 text-sm",
      regular: "h-10",
    },
  },
  defaultVariants: {
    scale: "regular",
  },
})

export type InputProps = React.ComponentPropsWithoutRef<"input"> & VariantProps<typeof inputVariants> & {}

export const Input = React.forwardRef<React.ElementRef<"input">, InputProps>(function InputComponent(
  { className, scale, ...props },
  ref
) {
  return (
    <input
      {...props}
      className={inputVariants({ scale, className })}
      ref={ref}
    />
  )
})

Input.displayName = "Input"
