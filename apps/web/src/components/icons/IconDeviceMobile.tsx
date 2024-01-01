import { cn } from "@/lib/utils"

export type IconDeviceMobileProps = React.ComponentPropsWithoutRef<"svg">

export function IconDeviceMobile({ className, ...props }: IconDeviceMobileProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("", className)}
    >
      <rect
        width={256}
        height={256}
        fill="none"
      />
      <rect
        x={64}
        y={24}
        width={128}
        height={208}
        rx={16}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
      <line
        x1={64}
        y1={56}
        x2={192}
        y2={56}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
      <line
        x1={64}
        y1={200}
        x2={192}
        y2={200}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={16}
      />
    </svg>
  )
}
