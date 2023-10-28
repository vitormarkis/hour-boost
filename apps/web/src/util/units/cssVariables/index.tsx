import { CSSProperties } from "react"
import { setPrefixDoubleDashes } from "@/util/units/setPrefixDoubleDashes"

type UpcomingCSSVariables = [cssVariable: string, value: string | number, sufix?: string]

export function cssVariables(
  upcomingCSSVariables: UpcomingCSSVariables[],
  mergingStyles?: CSSProperties
): CSSProperties

/**
 *
 * @param upcomingCSSVariables The CSS variable bits.
 * @param mergingStyles The current styles you wanna merge.
 *
 * ```tsx
 * const input = {
 *   upcomingCSSVariables: ["clientWidth", 300, "px"],
 *   mergingStyles: { color: "#000000" }
 * }
 *
 * const output = {
 *   color: "#000000",
 *   "--clientWidth": "300px",
 * }
 * ```
 */
export function cssVariables(
  upcomingCSSVariables: UpcomingCSSVariables,
  mergingStyles?: CSSProperties
): CSSProperties

export function cssVariables(
  upcomingCSSVariables: unknown,
  mergingStyles: CSSProperties = {}
): CSSProperties {
  if (typeof (upcomingCSSVariables as UpcomingCSSVariables)[0] === "string") {
    const [cssVariable, userValue, sufix] = upcomingCSSVariables as UpcomingCSSVariables
    const prefix = setPrefixDoubleDashes(cssVariable)

    const value = sufix ? String(userValue) + sufix ?? "" : userValue

    return {
      ...mergingStyles,
      [prefix]: value,
    }
  }

  const cssVariables = (upcomingCSSVariables as UpcomingCSSVariables[]).reduce(
    (acc: CSSProperties, [cssVariable, userValue, sufix]) => {
      const prefix = setPrefixDoubleDashes(cssVariable)

      const value = sufix ? String(userValue) + sufix ?? "" : userValue

      return {
        ...acc,
        [prefix]: value,
      }
    },
    {} as CSSProperties
  )

  return {
    ...mergingStyles,
    ...cssVariables,
  }
}

function handleCSSVariablePrefix(cssVariable: string) {
  const hasDoubleDashesPrefix = setPrefixDoubleDashes(cssVariable)
  return hasDoubleDashesPrefix ? cssVariable : `--${cssVariable}`
}
