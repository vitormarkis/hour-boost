import { IconJoystick } from "@/components/icons/IconJoystick"
import { getFarmedTimeSince } from "@/components/molecules/SteamAccountListItem"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { useUser } from "@/contexts/UserContext"
import { cn } from "@/lib/utils"
import { thisPlanIsUsage } from "@/util/thisPlanIsUsage"
import React from "react"
import { BadgePlanInfo, BadgePlanType, getPlanName } from "./components"

export function UserPlanStatus() {
  const { plan, steamAccounts } = useUser()
  const accountTotalFarmed = steamAccounts.reduce((acc, item) => {
    return acc + item.farmedTimeInSeconds
  }, 0)

  const planName = getPlanName(plan.name)

  return (
    <div className="flex justify-between pt-12">
      <div className="flex"></div>
      <div className="flex">
        <div className="flex flex-col justify-end rounded-md border border-dashed border-slate-900 p-3">
          <div className="flex gap-2 items-center justify-end">
            <span className="text-slate-400">Plano:</span>
            <BadgePlanType name={plan.name}>
              <span className="leading-none">{planName}</span>
            </BadgePlanType>
          </div>
          <div className="flex gap-2 pt-2 select-none justify-end">
            <HoverCard
              openDelay={300}
              closeDelay={0}
            >
              <HoverCardTrigger asChild>
                <BadgePlanInfo.Root className="hover:ring-2 hover:ring-slate-900/70 hover:cursor-pointer">
                  <BadgePlanInfo.Number className="border-slate-700 bg-slate-800">32</BadgePlanInfo.Number>
                  <BadgePlanInfo.SubWrapper className="border-slate-700 bg-slate-600 text-slate-300">
                    <BadgePlanInfo.Icon className="fill-slate-200">
                      <IconJoystick />
                    </BadgePlanInfo.Icon>
                    <BadgePlanInfo.Label>max</BadgePlanInfo.Label>
                  </BadgePlanInfo.SubWrapper>
                </BadgePlanInfo.Root>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-slate-300">
                  Quantidade máxima de jogos que você consegue farmar simultâneamente em uma conta da Steam.
                </p>
              </HoverCardContent>
            </HoverCard>
            <HoverCard
              openDelay={300}
              closeDelay={0}
            >
              <HoverCardTrigger asChild>
                <BadgePlanInfo.Root className="hover:ring-2 hover:ring-slate-900/70 hover:cursor-pointer">
                  <BadgePlanInfo.Number className="border-slate-700 bg-slate-800">1</BadgePlanInfo.Number>
                  <BadgePlanInfo.SubWrapper className="border-slate-700 bg-slate-600 text-slate-300">
                    <BadgePlanInfo.Icon className="fill-slate-200">
                      <IconUser />
                    </BadgePlanInfo.Icon>
                    <BadgePlanInfo.Label>max</BadgePlanInfo.Label>
                  </BadgePlanInfo.SubWrapper>
                </BadgePlanInfo.Root>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-slate-300">
                  Quantidade máxima de contas da Steam que você pode adicionar no seu painel.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="flex gap-2 pt-2 select-none justify-end">
            {thisPlanIsUsage(plan) ? (
              <RenderFormatter
                timeInSeconds={plan.maxUsageTime}
                render={text => (
                  <BadgePlanInfo.Root className="hover:ring-2 hover:ring-zinc-900/70 hover:cursor-pointer">
                    <BadgePlanInfo.SubWrapper className="border-zinc-700 bg-zinc-600 text-zinc-300">
                      <BadgePlanInfo.Icon className="fill-zinc-200">
                        <IconClock />
                      </BadgePlanInfo.Icon>
                      <BadgePlanInfo.Label>no máximo</BadgePlanInfo.Label>
                    </BadgePlanInfo.SubWrapper>
                    <BadgePlanInfo.Number className="border-zinc-700 bg-zinc-800">
                      {/* {text.highlightTime} */}
                      <div className="flex gap-1.5 items-end">
                        <span className="text-white font-medium">{text.highlightTime}</span>
                        {text.secondaryTime.length > 0 && (
                          <span className="text-zinc-400 text-sm">{text.secondaryTime}</span>
                        )}
                      </div>
                    </BadgePlanInfo.Number>
                  </BadgePlanInfo.Root>
                )}
              />
            ) : null}
          </div>
          <div className="flex gap-2 pt-2 select-none justify-end">
            {thisPlanIsUsage(plan) ? (
              <RenderFormatter
                timeInSeconds={plan.maxUsageTime - accountTotalFarmed}
                render={text => (
                  <BadgePlanInfo.Root className="hover:ring-2 hover:ring-slate-900/70 hover:cursor-pointer">
                    <BadgePlanInfo.Number className="border-slate-700 bg-slate-800">
                      {/* {text.highlightTime} */}
                      <div className="flex gap-1.5 items-end">
                        <span className="text-white font-medium">{text.highlightTime}</span>
                        {text.secondaryTime.length > 0 && (
                          <span className="text-slate-300 text-xs font-normal">{text.secondaryTime}</span>
                        )}
                      </div>
                    </BadgePlanInfo.Number>
                    <BadgePlanInfo.SubWrapper className="border-slate-700 bg-slate-600 text-slate-300">
                      <BadgePlanInfo.Label>restantes</BadgePlanInfo.Label>
                      <BadgePlanInfo.Icon className="fill-slate-200">
                        <IconHourGlass />
                      </BadgePlanInfo.Icon>
                    </BadgePlanInfo.SubWrapper>
                  </BadgePlanInfo.Root>
                )}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function RenderFormatter({
  timeInSeconds,
  render,
}: {
  render: React.FC<{ highlightTime: string; secondaryTime: string }>
  timeInSeconds: number
}) {
  const texts = getFarmedTimeSince(timeInSeconds)
  return render(texts)
}

export type IconUserProps = React.ComponentPropsWithoutRef<"svg">

export function IconUser({ className, ...props }: IconUserProps) {
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
      <path d="M230.93,220a8,8,0,0,1-6.93,4H32a8,8,0,0,1-6.92-12c15.23-26.33,38.7-45.21,66.09-54.16a72,72,0,1,1,73.66,0c27.39,8.95,50.86,27.83,66.09,54.16A8,8,0,0,1,230.93,220Z" />
    </svg>
  )
}

export type IconHourGlassProps = React.ComponentPropsWithoutRef<"svg">

export function IconHourGlass({ className, ...props }: IconHourGlassProps) {
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
      <path d="M200,75.64V40a16,16,0,0,0-16-16H72A16,16,0,0,0,56,40V76a16.07,16.07,0,0,0,6.4,12.8L114.67,128,62.4,167.2A16.07,16.07,0,0,0,56,180v36a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V180.36a16.08,16.08,0,0,0-6.35-12.76L141.27,128l52.38-39.59A16.09,16.09,0,0,0,200,75.64ZM178.23,176H77.33L128,138ZM184,75.64,128,118,72,76V40H184Z" />
    </svg>
  )
}

export type IconClockProps = React.ComponentPropsWithoutRef<"svg">

export function IconClock({ className, ...props }: IconClockProps) {
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
      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,112H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z" />
    </svg>
  )
}
