import { cn } from "@/lib/utils"
import React from "react"

export type IconPullRequestProps = React.ComponentPropsWithoutRef<"svg">

export function IconPullRequest({ className, ...props }: IconPullRequestProps) {
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
      <path d="M104,64A32,32,0,1,0,64,95v66a32,32,0,1,0,16,0V95A32.06,32.06,0,0,0,104,64ZM88,192a16,16,0,1,1-16-16A16,16,0,0,1,88,192Zm144,0a32,32,0,1,1-40-31V123.88A39.71,39.71,0,0,0,180.28,95.6L152,67.31V96a8,8,0,0,1-16,0V48a8,8,0,0,1,8-8h48a8,8,0,0,1,0,16H163.31L191.6,84.28a55.67,55.67,0,0,1,16.4,39.6V161A32.06,32.06,0,0,1,232,192Z" />
    </svg>
  )
}
