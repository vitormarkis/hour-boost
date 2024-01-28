import { PlanInfinity, PlanUsage } from "core"
import { FarmInfinityService, FarmService, FarmUsageService } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { Builder, EventEmitterBuilder } from "~/utils/builders"

export class FarmServiceBuilder implements Builder<FarmService> {
  private readonly publisher: Publisher
  private readonly emitterBuilder: EventEmitterBuilder

  constructor(props: FarmServiceFactoryProps) {
    this.publisher = props.publisher
    this.emitterBuilder = props.emitterBuilder
  }

  create(
    username: string,
    plan: PlanUsage | PlanInfinity,
    now: Date
  ): FarmUsageService | FarmInfinityService {
    if (plan.type === "INFINITY")
      return new FarmInfinityService(this.publisher, plan as PlanInfinity, username, new Date())
    if (plan.type === "USAGE")
      return new FarmUsageService({
        emitter: this.emitterBuilder.create(),
        now,
        plan: plan as PlanUsage,
        publisher: this.publisher,
        username,
      })
    console.log(plan.type)
    throw new Error("Invalid planType provided.")
  }
}

export type FarmServiceFactoryProps = {
  publisher: Publisher
  emitterBuilder: EventEmitterBuilder
}
