import { VariantProps, cva } from "class-variance-authority"
import { PlanAllNames } from "core"
import { PropsWithChildren } from "react"

export function getPlanName(planName: PlanAllNames): string {
  const planNamesMapper: Record<PlanAllNames, string> = {
    DIAMOND: "Diamante",
    GOLD: "Ouro",
    GUEST: "Convidado",
    SILVER: "Prata",
  }

  return planNamesMapper[planName]
}

export const badgePlanTypeVariants = cva("border py-0 5 px-2 shadow-md", {
  variants: {
    name: {
      DIAMOND: "bg-sky-600 border-sky-500 text-sky-100 shadow-sky-800/60",
      GOLD: "bg-amber-600 border-amber-500 text-amber-100 shadow-yellow-800/60",
      GUEST: "bg-zinc-600 border-neutral-600 text-zinc-100 shadow-black-800/60",
      SILVER: "bg-neutral-100 border-white text-neutral-600 shadow-white/20",
    },
  },
  defaultVariants: {},
})

export function BadgePlanType({
  children,
  name,
}: PropsWithChildren & VariantProps<typeof badgePlanTypeVariants>) {
  return <div className={badgePlanTypeVariants({ name })}>{children}</div>
}
