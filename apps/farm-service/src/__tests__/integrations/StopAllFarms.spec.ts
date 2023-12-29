import { PlanInfinity, PlanUsage } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  password,
  testUsers as s,
} from "~/__tests__/instances"
import { UserCompletedFarmSessionInfinityCommand } from "~/application/commands/UserCompletedFarmSessionInfinityCommand"
import { PlanBuilder } from "~/application/factories/PlanFactory"
import { StopAllFarms } from "~/application/use-cases/StopAllFarms"
import { PersistFarmSessionUsageHandler } from "~/domain/handler"
import { PersistFarmSessionInfinityHandler } from "~/domain/handler/PersistFarmSessionInfinityHandler"

import { FarmGamesController } from "~/presentation/controllers"

const validSteamAccounts = [
  { accountName: "paco", password },
  { accountName: "fred", password },
  { accountName: "bane", password },
]

const log = console.log
console.log = () => {}

let i = makeTestInstances({ validSteamAccounts })
let meInstances = i.makeUserInstances("me", s.me)
let friendInstances = i.makeUserInstances("friend", s.friend)
let farmGamesController: FarmGamesController
let stopAllFarms: StopAllFarms

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  friendInstances = await i.createUser("friend")
  const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
  await i.changeUserPlan(diamondPlan)
  await i.addSteamAccount(s.me.userId, s.me.accountName2, password)
  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    planRepository: i.planRepository,
    publisher: i.publisher,
    sacStateCacheRepository: i.sacStateCacheRepository,
    usersClusterStorage: i.usersClusterStorage,
    usersRepository: i.usersRepository,
  })
  stopAllFarms = new StopAllFarms(i.usersClusterStorage)
}

beforeEach(async () => {
  await setupInstances({ validSteamAccounts })
})

describe("2 infinity plan and 1 usage plan farming ", () => {
  beforeEach(async () => {
    await farmGamesController.handle({
      payload: { accountName: s.me.accountName, gamesID: [109230], userId: s.me.userId },
    })
    await farmGamesController.handle({
      payload: { accountName: s.me.accountName2, gamesID: [109230], userId: s.me.userId },
    })
    await farmGamesController.handle({
      payload: { accountName: s.friend.accountName, gamesID: [109230], userId: s.friend.userId },
    })

    i.publisher.register(new PersistFarmSessionInfinityHandler(i.planRepository, i.usageBuilder))
    i.publisher.register(new PersistFarmSessionUsageHandler(i.planRepository, i.usageBuilder))
  })

  test("should list all users SACs as farming", async () => {
    expect(i.allUsersClientsStorage.listUsers()).toStrictEqual({
      [s.me.userId]: {
        [s.me.accountName]: {
          farming: true,
        },
        [s.me.accountName2]: {
          farming: true,
        },
      },
      [s.friend.userId]: {
        [s.friend.accountName]: {
          farming: true,
        },
        [s.friend.accountName2]: {
          farming: false,
        },
      },
    })
  })

  test("should list all users services as farming", async () => {
    expect(i.usersClusterStorage.getAccountsStatus()).toStrictEqual({
      [s.me.username]: {
        [s.me.accountName]: "FARMING",
        [s.me.accountName2]: "FARMING",
      },
      [s.friend.username]: {
        [s.friend.accountName]: "FARMING",
      },
    })
  })

  describe("Stopped all farms test suite", () => {
    let spyPublish: jest.SpyInstance
    beforeEach(async () => {
      spyPublish = jest.spyOn(i.publisher, "publish")
      stopAllFarms.execute()
      await new Promise(setImmediate)
    })

    test("should list all users SACs as not farming", async () => {
      expect(i.allUsersClientsStorage.listUsers()).toStrictEqual({
        [s.me.userId]: {
          [s.me.accountName]: {
            farming: false,
          },
          [s.me.accountName2]: {
            farming: false,
          },
        },
        [s.friend.userId]: {
          [s.friend.accountName]: {
            farming: false,
          },
          [s.friend.accountName2]: {
            farming: false,
          },
        },
      })
    })

    test("should list all users services as not farming", async () => {
      expect(i.usersClusterStorage.getAccountsStatus()).toStrictEqual({
        [s.me.username]: {},
        [s.friend.username]: {
          [s.friend.accountName]: "IDDLE",
        },
      })
    })

    test("should persist usages on plan", async () => {
      // console.log = log
      const mePlan = (await i.planRepository.getById(meInstances.me.plan.id_plan)) as PlanInfinity
      const friendPlan = (await i.planRepository.getById(friendInstances.friend.plan.id_plan)) as PlanUsage
      expect(mePlan.usages.data).toHaveLength(2)
      expect(friendPlan.usages.data).toHaveLength(1)
    })
  })
})
