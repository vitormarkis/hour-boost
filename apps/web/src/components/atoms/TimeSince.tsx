"use client"
import { cn } from "@/lib/utils"
import { createFormatter } from "core"
import { createContext, useContext, useEffect, useState } from "react"

const formatter = createFormatter()

export function useTimeSince(date: Date) {
  const [timeSince, setTimeSince] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const differenceInMilliseconds = now.getTime() - date.getTime()
      setTimeSince(differenceInMilliseconds)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return { timeSince: formatter.format(timeSince) }
}

interface ITimeSinceContext {
  highlightTime: string
  secondaryTime: string
}

const TimeSinceContext = createContext({} as ITimeSinceContext)

import React from "react"

export type TimeSinceRootProps = React.ComponentPropsWithoutRef<"div"> & {
  date: Date
  children: React.ReactNode
  column?: boolean
}

export const TimeSinceRoot = React.forwardRef<React.ElementRef<"div">, TimeSinceRootProps>(
  function TimeSinceRootComponent({ column, children, date, className, ...props }, ref) {
    const dateInstance = typeof date === "string" ? new Date(date) : date
    const { timeSince } = useTimeSince(dateInstance)
    const [timeNumber, category, ...secondaryRest] = timeSince.split(" ")

    const highlightTime = [timeNumber, category].join(" ")
    const secondaryTime = secondaryRest.join(" ")

    return (
      <TimeSinceContext.Provider
        value={{
          highlightTime,
          secondaryTime,
        }}
      >
        <div
          {...props}
          className={cn("flex relative tabular-nums", column && "flex-col", className)}
          ref={ref}
        >
          {children}
        </div>
      </TimeSinceContext.Provider>
    )
  }
)

TimeSinceRoot.displayName = "TimeSinceRoot"

export type TimeSinceHighlightTimeProps = React.ComponentPropsWithoutRef<"strong"> & {}

export const TimeSinceHighlightTime = React.forwardRef<
  React.ElementRef<"strong">,
  TimeSinceHighlightTimeProps
>(function TimeSinceHighlightTimeComponent({ className, ...props }, ref) {
  const { highlightTime } = useContext(TimeSinceContext)

  return (
    <strong
      {...props}
      className={cn("leading-none font-medium whitespace-nowrap", className)}
      ref={ref}
    >
      {highlightTime}
    </strong>
  )
})

TimeSinceHighlightTime.displayName = "TimeSinceHighlightTime"

export type TimeSinceSecondaryTimeProps = React.ComponentPropsWithoutRef<"span"> & {
  suspense?: "bottom" | false
}

export const TimeSinceSecondaryTime = React.forwardRef<React.ElementRef<"span">, TimeSinceSecondaryTimeProps>(
  function TimeSinceSecondaryTimeComponent({ suspense = "bottom", className, ...props }, ref) {
    const { secondaryTime } = useContext(TimeSinceContext)

    const Text: React.FC = () => (
      <span
        {...props}
        className={cn("pt-0.5 leading-none text-xs text-slate-500 whitespace-nowrap", className)}
        ref={ref}
      >
        {secondaryTime}
      </span>
    )

    if (suspense === false) return <Text />

    return (
      <div className="absolute top-full">
        <Text />
      </div>
    )
  }
)

TimeSinceSecondaryTime.displayName = "TimeSinceSecondaryTime"

export const TimeSince = {
  Root: TimeSinceRoot,
  HighlightTime: TimeSinceHighlightTime,
  SecondaryTime: TimeSinceSecondaryTime,
}
