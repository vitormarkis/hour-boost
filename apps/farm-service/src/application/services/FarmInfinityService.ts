import { PlanType, User } from "core"
import { UserHasStartFarmingCommand, UserPauseInfinityFarmSessionCommand } from "~/application/commands"
import { IFarmService, FarmServiceStatus, FarmStatusCount } from "~/application/services"
import { Publisher } from "~/infra/queue"

export class FarmInfinityService implements IFarmService {
  type: PlanType = "INFINITY"
  status: FarmServiceStatus = "IDDLE"

  constructor(
    private readonly publisher: Publisher,
    readonly username: string,
    readonly planId: string,
    readonly ownerId: string
  ) {}

  async startFarm(): Promise<void> {
    this.status = "FARMING"
    this.publisher.publish(
      new UserHasStartFarmingCommand({
        planId: this.planId,
        userId: this.ownerId,
      })
    )
  }

  async stopFarm(): Promise<void> {
    this.status = "IDDLE"
    this.publisher.publish(
      new UserPauseInfinityFarmSessionCommand({
        username: this.username,
      })
    )
  }

  listFarmingStatusCount(): FarmStatusCount {
    throw new Error("Method not implemented.")
  }
}
