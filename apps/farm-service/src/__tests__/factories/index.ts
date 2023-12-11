import { PlanRepository, SteamAccountClientStateCacheRepository, SteamAccountCredentials, User } from "core"
import { FarmServiceFactory } from "~/application/factories"
import { UserSACsFarmingCluster } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { Publisher } from "~/infra/queue"
import { makeEventEmitter, makeSteamBuilder } from "~/utils/builders"

export function makeSACFactory(validSteamAccounts: SteamAccountCredentials[], publisher: Publisher) {
  return (user: User, accountName: string) =>
    new SteamAccountClient({
      instances: {
        emitter: makeEventEmitter().create(),
        publisher,
      },
      props: {
        accountName,
        client: makeSteamBuilder(validSteamAccounts).create(),
        userId: user.id_user,
        username: user.username,
      },
    })
}

export function makeFarmService(user: User, publisher: Publisher) {
  return new FarmServiceFactory({
    publisher,
    username: user.username,
  }).createNewFarmService(user.plan)
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
      farmServiceFactory: new FarmServiceFactory({
        publisher,
        username: user.username,
      }),
      planId: user.plan.id_plan,
      planRepository,
    })
}
