import { PlanInfinity, PlanUsage } from "core"
import { FarmInfinityService, FarmUsageService } from "~/application/services"
import { FarmService } from "~/application/services"
import { Publisher } from "~/infra/queue"

export class FarmServiceFactory {
  private readonly publisher: Publisher
  private readonly username: string

  constructor(props: FarmServiceFactoryProps) {
    this.publisher = props.publisher
    this.username = props.username
  }

  createNewFarmService(plan: PlanUsage | PlanInfinity): FarmService {
    if (plan.type === "INFINITY")
      return new FarmInfinityService(this.publisher, plan as PlanInfinity, this.username, new Date())
    if (plan.type === "USAGE")
      return new FarmUsageService(this.publisher, plan as PlanUsage, this.username, new Date())
    console.log(plan.type)
    throw new Error("Invalid planType provided.")
  }
}

export type FarmServiceFactoryProps = {
  publisher: Publisher
  username: string
}
