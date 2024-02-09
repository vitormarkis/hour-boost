import { PlanAllNames } from "core"

export function getPlanName(planName: PlanAllNames): string {
  const planNamesMapper: Record<PlanAllNames, string> = {
    DIAMOND: "Diamante",
    GOLD: "Ouro",
    GUEST: "Convidado",
    SILVER: "Prata",
  }

  return planNamesMapper[planName]
}
