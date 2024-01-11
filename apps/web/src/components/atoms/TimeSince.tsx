"use client"
import { cn } from "@/lib/utils"
import { createContext, useContext, useEffect, useState } from "react"

const MINUTE = 60
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export function createFormatter() {
  const format = (timeInMiliseconds: number) => {
    const timeInSeconds = timeInMiliseconds / 1000

    // seconds
    if (isBetweenRange(timeInSeconds, 0, MINUTE)) {
      const seconds = floor(timeInSeconds)
      return `${seconds} segundo${hasS(seconds)}`
    }
    // minutes
    if (isBetweenRange(timeInSeconds, MINUTE, HOUR)) {
      const minutes = floor(timeInSeconds / MINUTE)
      const seconds = floor(timeInSeconds % MINUTE)
      const secondsString = parseInt(seconds) > 0 ? ` e ${seconds} segundo${hasS(seconds)}` : ""
      return `${minutes} minuto${hasS(minutes)}${secondsString}`
    }
    // hours
    if (isBetweenRange(timeInSeconds, HOUR, DAY)) {
      const hours = floor(timeInSeconds / HOUR)
      const minutes = floor((timeInSeconds % HOUR) / MINUTE)
      const minutesString = parseInt(minutes) > 0 ? ` e ${minutes} minuto${hasS(minutes)}` : ""
      return `${hours} hora${hasS(hours)}${minutesString}`
    }
    // days
    if (isBetweenRange(timeInSeconds, DAY, WEEK)) {
      const days = floor(timeInSeconds / DAY)
      const hours = floor((timeInSeconds % DAY) / HOUR)
      const hoursString = parseInt(hours) > 0 ? ` e ${hours} hora${hasS(hours)}` : ""
      return `${days} dia${hasS(days)}${hoursString}`
    }
    // weeks
    if (isBetweenRange(timeInSeconds, WEEK, MONTH)) {
      const weeks = floor(timeInSeconds / WEEK)
      const days = floor((timeInSeconds % WEEK) / DAY)
      const daysString = parseInt(days) > 0 ? ` e ${days} dia${hasS(days)}` : ""
      return `${weeks} semana${hasS(weeks)}${daysString}`
    }
    // months
    if (isBetweenRange(timeInSeconds, MONTH, YEAR)) {
      const months = floor(timeInSeconds / MONTH)
      const weeks = floor((timeInSeconds % MONTH) / WEEK)
      const weeksString = parseInt(weeks) > 0 ? ` e ${weeks} semana${hasS(weeks)}` : ""
      return `${months} ${hasMeses(months)}${weeksString}`
    }
    return `${timeInSeconds} segundos`
  }

  return {
    format,
  }
}

const floor = (value: number) => Number(Math.floor(value)).toFixed(0)
const hasS = (value: string) => (value != "1" ? "s" : "")
const hasMeses = (value: string) => (value != "1" ? "meses" : "mês")
const isBetweenRange = (value: number, min: number, max: number) => value >= min && value < max

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
    const { timeSince } = useTimeSince(date)
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
