import { Usage, UsageCreateProps } from "core"
import { Builder } from "~/utils/builders/builder.interface"

export class UsageBuilder implements Builder<Usage> {
  create({ accountName, amountTime, createdAt, plan_id }: UsageCreateProps): Usage {
    return Usage.create({
      accountName,
      amountTime,
      createdAt,
      plan_id,
    })
  }
}
