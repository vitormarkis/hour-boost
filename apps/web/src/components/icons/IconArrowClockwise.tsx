import { cn } from "@/lib/utils"
import React from "react"

export type IconArrowClockwiseProps = React.ComponentPropsWithoutRef<"svg">

export function IconArrowClockwise({ className, ...props }: IconArrowClockwiseProps) {
  return (
    <svg
      {...props}
      className={cn("", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <polyline
        points="184 104 232 104 232 56"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
      <path
        d="M188.4,192a88,88,0,1,1,1.83-126.23L232,104"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={24}
      />
    </svg>
  )
}
