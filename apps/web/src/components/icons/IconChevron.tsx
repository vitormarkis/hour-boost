import { cn } from "@/lib/utils"
import React from "react"

export type IconChevronProps = React.ComponentPropsWithoutRef<"svg">

export function IconChevron({ className, ...props }: IconChevronProps) {
  return (
    <svg
      className={cn("lucide lucide-chevron-down", className)}
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
