import { PlanInfinity, PlanRepository, PlanUsage, SteamAccountClientStateCacheRepository } from "core"
import { FarmServiceBuilder } from "~/application/factories"
import { UserSACsFarmingCluster } from "~/application/services"
import { Publisher } from "~/infra/queue"
import { Builder, EventEmitterBuilder } from "~/utils/builders"
import { UsageBuilder } from "~/utils/builders/UsageBuilder"

export class UserClusterBuilder implements Builder<UserSACsFarmingCluster> {
  constructor(
    private readonly farmServiceFactory: FarmServiceBuilder,
    private readonly sacStateCacheRepository: SteamAccountClientStateCacheRepository,
    private readonly planRepository: PlanRepository,
    private readonly emitterBuilder: EventEmitterBuilder,
    private readonly publisher: Publisher,
    private readonly usageBuilder: UsageBuilder
  ) {}

  create(username: string, plan: PlanUsage | PlanInfinity): UserSACsFarmingCluster {
    return new UserSACsFarmingCluster({
      farmService: this.farmServiceFactory.create(username, plan, new Date()), // deveria ser nulo ja que nao nesse momento nao tem ninguem farmando... pode levar a erros
      sacStateCacheRepository: this.sacStateCacheRepository,
      farmServiceFactory: this.farmServiceFactory,
      planRepository: this.planRepository,
      username,
      planId: plan.id_plan,
      emitter: this.emitterBuilder.create(),
      publisher: this.publisher,
      usageBuilder: this.usageBuilder,
    })
  }
}
