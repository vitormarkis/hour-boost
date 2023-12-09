import { PlanInfinity, PlanType } from "core";
import { FarmService } from "~/application/services/FarmService";
import { Publisher } from "~/infra/queue";

export class FarmInfinityService extends FarmService {
  type: PlanType = "INFINITY"

  constructor(publisher: Publisher, plan: PlanInfinity, username: string, now: Date) {
    super({
      planId: plan.id_plan,
      startedAt: now,
      userId: plan.ownerId,
      username
    })
  }

  protected startFarmImpl(): void {
    throw new Error("Method not implemented.");
  }
  protected stopFarmImpl(): void {
    throw new Error("Method not implemented.");
  }
}
