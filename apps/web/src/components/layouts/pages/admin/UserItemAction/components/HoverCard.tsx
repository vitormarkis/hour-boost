import { ComponentProps } from "react"
import { twc } from "react-twc"

const HoverCardTWC = twc.div`
  absolute left-1/2 -translate-x-1/2 top-[calc(100%_+_0.5rem)] w-48 py-1.5 px-1.5 border bg-slate-900 border-slate-800 text-sm flex flex-col items-center

  data-[open=false]:scale-95
  data-[open=false]:opacity-0
  data-[open=false]:invisible
  data-[open=true]:scale-1
  data-[open=true]:opacity-100
  data-[open=true]:visible
  transition-all
  duration-300
`

export const HoverCard: React.FC<ComponentProps<typeof HoverCardTWC>> = props => {
  return (
    <HoverCardTWC
      {...props}
      style={{
        transitionTimingFunction: "ease-[cubic-bezier(0, 0.8, 0.2, 1)]",
        ...props.style,
      }}
    />
  )
}
