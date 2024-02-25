import { PlanAllNames } from "core"

export function getPlanName(planName: PlanAllNames): string {
  const planNamesMapper: Record<PlanAllNames, string> = {
    DIAMOND: "Diamante",
    GOLD: "Ouro",
    GUEST: "Convidado",
    SILVER: "Prata",
    "INFINITY-CUSTOM": "Custom Infinity",
    "USAGE-CUSTOM": "Custom Usage",
  }

  return planNamesMapper[planName]
}
