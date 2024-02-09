import { PurchaseType } from "@/pages/admin"

export function getTypeText(type: PurchaseType) {
  const typeTextMapping: Record<PurchaseType, string> = {
    "TRANSACTION-PLAN": "Upgrade de plano",
  }

  return typeTextMapping[type]
}
