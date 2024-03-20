import { PlanAllNames } from "core"

export function getPlanName(planName: PlanAllNames, custom: boolean): string {
  const planNamesMapper: Record<PlanAllNames, string> = {
    DIAMOND: "Diamante",
    GOLD: "Ouro",
    GUEST: "Convidado",
    SILVER: "Prata",
  }

  return `${planNamesMapper[planName]}${custom ? "*" : ""}`
}
