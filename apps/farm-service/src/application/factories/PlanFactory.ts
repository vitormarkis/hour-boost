import { DiamondPlan, GuestPlan } from "core"

export class PlanBuilder {
  constructor(private readonly ownerId: string) {}

  usage() {
    return new UsagePlanBuilder(this.ownerId)
  }

  infinity() {
    return new InfinityPlanBuilder(this.ownerId)
  }
}

class UsagePlanBuilder {
  constructor(private readonly ownerId: string) {}
  guest() {
    return GuestPlan.create({
      ownerId: this.ownerId,
    })
  }
}

class InfinityPlanBuilder {
  constructor(private readonly ownerId: string) {}
  diamond() {
    return DiamondPlan.create({
      ownerId: this.ownerId,
    })
  }
}
