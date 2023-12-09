import { PlanInfinity, PlanUsage } from "core"
import { FarmInfinityService, FarmUsageService, IFarmService } from "~/application/services"
import { Publisher } from "~/infra/queue"

export class FarmServiceFactory {
  private readonly publisher: Publisher
  private readonly username: string

  constructor(props: FarmServiceFactoryProps
  ) {
    this.publisher = props.publisher
    this.username = props.username
  }

  createNewFarmService(plan: PlanUsage | PlanInfinity): IFarmService {
    if (plan.type === "INFINITY") return new FarmInfinityService(
      this.publisher,
      plan.id_plan,
      plan.ownerId
    )
    if (plan.type === "USAGE") return new FarmUsageService(this.publisher, plan as PlanUsage, this.username)
    console.log(plan.type)
    throw new Error("Invalid planType provided.")
  }
}

export type FarmServiceFactoryProps = {
  publisher: Publisher,
  username: string,

}
