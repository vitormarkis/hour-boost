import { VariantProps, cva } from "class-variance-authority"

export const badgePlanTypeVariants = cva("border py-0 5 shadow-md", {
  variants: {
    name: {
      DIAMOND: "bg-sky-600 border-sky-500 text-sky-100 shadow-sky-800/60",
      GOLD: "bg-amber-600 border-amber-500 text-amber-100 shadow-yellow-800/60",
      GUEST: "bg-zinc-600 border-neutral-600 text-zinc-100 shadow-black-800/60",
      SILVER: "bg-neutral-100 border-white text-neutral-600 shadow-white/20",
    },
    size: {
      regular: "px-2",
      sm: "px-2 text-sm",
    },
  },
  defaultVariants: {
    size: "regular",
  },
})

export function BadgePlanType({
  className,
  size,
  name,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgePlanTypeVariants>) {
  return (
    <div
      {...props}
      className={badgePlanTypeVariants({ size, name, className })}
    />
  )
}
