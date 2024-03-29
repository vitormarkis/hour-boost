import { DiamondPlan, GoldPlan, GuestPlan, SilverPlan } from "core"

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
  gold() {
    return GoldPlan.create({
      ownerId: this.ownerId,
    })
  }
  silver() {
    return SilverPlan.create({
      ownerId: this.ownerId,
    })
  }
}
