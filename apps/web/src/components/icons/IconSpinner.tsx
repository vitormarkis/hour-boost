import { cn } from "@/lib/utils"
import twc from "tailwindcss/colors"

export type IconSpinnerProps = React.ComponentPropsWithoutRef<"svg">

export function IconSpinner({ className, ...props }: IconSpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      {...props}
      className={cn("animate-spin-r", className)}
    >
      <radialGradient
        id="a10"
        cx=".66"
        fx=".66"
        cy=".3125"
        fy=".3125"
        gradientTransform="scale(1.5)"
      >
        <stop
          offset={0}
          stopColor={twc.slate["800"]}
        />
        <stop
          offset=".3"
          stopColor={twc.slate["800"]}
          stopOpacity=".9"
        />
        <stop
          offset=".6"
          stopColor={twc.slate["800"]}
          stopOpacity=".6"
        />
        <stop
          offset=".8"
          stopColor={twc.slate["800"]}
          stopOpacity=".3"
        />
        <stop
          offset={1}
          stopColor={twc.slate["800"]}
          stopOpacity={0}
        />
      </radialGradient>
      <circle
        transform-origin="center"
        fill="none"
        stroke="url(#a10)"
        strokeWidth={30}
        strokeLinecap="round"
        strokeDasharray="200 1000"
        strokeDashoffset={0}
        cx={100}
        cy={100}
        r={70}
      />
      <circle
        transform-origin="center"
        fill="none"
        opacity=".2"
        stroke={twc.slate["800"]}
        strokeWidth={30}
        strokeLinecap="round"
        cx={100}
        cy={100}
        r={70}
      />
    </svg>
  )
}
