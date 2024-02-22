import { PurchaseSession } from "core"
import { PurchasePayloadTransactionPlan } from "./payloads/transaction-plan"

export type PurchasePayloadProps = {
  purchase: PurchaseSession
}

export function PurchasePayload({ purchase }: PurchasePayloadProps) {
  if (purchase.type.name === "TRANSACTION-PLAN") {
    return <PurchasePayloadTransactionPlan payload={purchase.type} />
  }

  throw new Error(`Invalid payload of type ${purchase.type.name}`)
}
