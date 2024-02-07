import { cn } from "@/lib/utils"
import React from "react"

export type IconPlusProps = React.ComponentPropsWithoutRef<"svg">

export function IconPlus({ className, ...props }: IconPlusProps) {
  return (
    <svg
      {...props}
      className={cn("lucide lucide-plus", className)}
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
