import React from "react"
import { cn } from "@/lib/utils"
import { twc } from "react-twc"

export type SteamAccountAdminListHeaderProps = React.ComponentPropsWithoutRef<"header"> & {}

export const SteamAccountAdminListHeader = React.forwardRef<
  React.ElementRef<"header">,
  SteamAccountAdminListHeaderProps
>(function SteamAccountAdminListHeaderComponent({ className, ...props }, ref) {
  return (
    <header
      {...props}
      className={cn("flex", className)}
      ref={ref}
    >
      <div className="mr-2 w-[calc(var(--sa-padding-left)_+_var(--container-height))]" />
      <ColumnWrapper className="w-[--sa-name-width] justify-start">
        <ColumnTitle>nome</ColumnTitle>
      </ColumnWrapper>
      <ColumnWrapper className="w-[--sa-farm-since-width]">
        <ColumnTitle>farmando</ColumnTitle>
      </ColumnWrapper>
      <ColumnWrapper className="w-[--sa-farmed-time-width]">
        <ColumnTitle>horas farmadas</ColumnTitle>
      </ColumnWrapper>
      <ColumnWrapper className="ml-auto w-[--sa-games-width]">
        <ColumnTitle>jogos em staging</ColumnTitle>
      </ColumnWrapper>
      <ColumnWrapper className="w-[--sa-games-width]">
        <ColumnTitle>jogos farmando</ColumnTitle>
      </ColumnWrapper>
    </header>
  )
})

// "--sa-name-width": "10rem",
// "--sa-farm-since-width": "9rem",
// "--sa-farmed-time-width": "9rem",
// "--sa-games-width": "10rem",

SteamAccountAdminListHeader.displayName = "SteamAccountAdminListHeader"

type ColumnWrapperProps = React.ComponentPropsWithoutRef<"div"> & {}

const ColumnWrapper = React.forwardRef<React.ElementRef<"div">, ColumnWrapperProps>(
  function ColumnWrapperComponent({ className, ...props }, ref) {
    return (
      <div
        {...props}
        className={cn("flex h-9 items-center justify-center px-2", className)}
        ref={ref}
      />
    )
  }
)

ColumnWrapper.displayName = "ColumnWrapper"

const ColumnTitle = twc.h4`font-medium text-sm text-slate-500`
