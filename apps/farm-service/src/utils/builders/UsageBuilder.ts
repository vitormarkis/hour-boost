import { Usage, type UsageCreateProps } from "core"
import type { Builder } from "~/utils/builders/builder.interface"

export class UsageBuilder implements Builder<Usage> {
  create({ user_id, accountName, amountTime, createdAt, plan_id }: UsageCreateProps): Usage {
    return Usage.create({
      accountName,
      amountTime,
      createdAt,
      plan_id,
      user_id,
    })
  }
}
