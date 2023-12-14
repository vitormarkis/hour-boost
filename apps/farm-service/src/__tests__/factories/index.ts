import { PlanRepository, SteamAccountClientStateCacheRepository, SteamAccountCredentials, User } from "core"
import { FarmServiceBuilder } from "~/application/factories"
import { UserSACsFarmingCluster } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { EventEmitterBuilder, SteamUserMockBuilder } from "~/utils/builders"

export function makeSACFactory(validSteamAccounts: SteamAccountCredentials[], publisher: Publisher) {
  function sacFactory(user: User, accountName: string) {
    return new SteamAccountClient({
      instances: {
        emitter: new EventEmitterBuilder().create(),
        publisher,
      },
      props: {
        accountName,
        client: new SteamUserMockBuilder(validSteamAccounts).create(),
        userId: user.id_user,
        username: user.username,
      },
    })
  }
  return sacFactory
}

export function makeFarmService(user: User, publisher: Publisher) {
  return new FarmServiceBuilder({
    publisher,
  }).create(user.username, user.plan)
}

export function makeUserClusterFactory(
  publisher: Publisher,
  sacStateCacheRepository: SteamAccountClientStateCacheRepository,
  planRepository: PlanRepository
) {
  return (user: User) =>
    new UserSACsFarmingCluster({
      farmService: makeFarmService(user, publisher),
      sacStateCacheRepository,
      username: user.username,
      farmServiceFactory: new FarmServiceBuilder({
        publisher,
      }),
      planId: user.plan.id_plan,
      planRepository,
    })
}
