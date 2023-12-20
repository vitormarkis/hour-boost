import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  makeUserInstances,
  password,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"
import { UserCompletedFarmSessionUsageCommand } from "~/application/commands"
import { PlanBuilder } from "~/application/factories/PlanFactory"
import { StopAllFarms } from "~/application/use-cases"
import { HttpClient } from "~/contracts"
import { PersistFarmSessionUsageHandler } from "~/domain/handler"
import { PersistFarmSessionInfinityHandler } from "~/domain/handler/PersistFarmSessionInfinityHandler"
import { FarmGamesController } from "~/presentation/controllers"
import { StopAllFarmsController } from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = makeUserInstances("me", s.me, i.sacFactory)
let friendInstances = makeUserInstances("friend", s.friend, i.sacFactory)
let stopAllFarmsUseCase: StopAllFarms
let stopAllFarmsController: StopAllFarmsController
let farmGamesController: FarmGamesController

function ensureExpectation(status: number, response: HttpClient.Response) {
  expect(response.status).toBe(status)
  if (status !== response.status) console.log(response.json)
}

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  friendInstances = await i.createUser("friend")
  stopAllFarmsUseCase = new StopAllFarms(i.usersClusterStorage)
  stopAllFarmsController = new StopAllFarmsController(stopAllFarmsUseCase)
  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    planRepository: i.planRepository,
    publisher: i.publisher,
    sacStateCacheRepository: i.sacStateCacheRepository,
    usersClusterStorage: i.usersClusterStorage,
    usersRepository: i.usersRepository,
  })
}

const OLD_ENV = process.env
beforeEach(async () => {
  jest.resetModules()
  process.env = { ...OLD_ENV }
  process.env.ACTIONS_SECRET = "secret"
  await setupInstances({
    validSteamAccounts,
  })
  i.publisher.register(new PersistFarmSessionUsageHandler(i.planRepository, i.usageBuilder))
  i.publisher.register(new PersistFarmSessionInfinityHandler(i.planRepository, i.usageBuilder))
})

afterEach(() => {
  i.publisher.observers = []
})

test("1xUser -> 2 Account (Infinity); should persist 2 usages of 2 hours", async () => {
  jest.useFakeTimers({ doNotFake: ["setImmediate", "setTimeout"] })
  const spyPublish = jest.spyOn(i.publisher, "publish")
  const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
  await i.changeUserPlan(diamondPlan)
  await i.addSteamAccount(s.me.userId, s.me.accountName2, password)

  const farmAccount1 = await promiseHandler(
    farmGamesController.handle({
      payload: { accountName: s.me.accountName, gamesID: [1090], userId: s.me.userId },
    })
  )
  const farmAccount2 = await promiseHandler(
    farmGamesController.handle({
      payload: { accountName: s.me.accountName2, gamesID: [1090], userId: s.me.userId },
    })
  )
  ensureExpectation(200, farmAccount1)
  ensureExpectation(200, farmAccount2)
  jest.advanceTimersByTime(3600 * 1000 * 1.5)
  await promiseHandler(stopAllFarmsController.handle({ payload: { secret: "secret" } }))
  await new Promise(setImmediate)
  console.log({ observes: i.publisher.observers })
  const infinityUsages = spyPublish.mock.calls
    .filter(([call]) => call.operation === "user-complete-farm-session-infinity")
    .flat(1)

  console.log({ infinityUsages })

  const mePlan = await i.planRepository.getById(meInstances.me.plan.id_plan)
  const [usageAccount1, usageAccount2] = mePlan?.usages.data ?? []
  expect(mePlan?.usages.data).toHaveLength(2)
  expect(usageAccount1.accountName).toBe(s.me.accountName)
  expect(usageAccount2.accountName).toBe(s.me.accountName2)
  expect(usageAccount1.amountTime).toBe(5400)
  expect(usageAccount2.amountTime).toBe(5400)
  jest.useRealTimers()
})

describe("Start 2 farming, and stop all farms test suite", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  test("should call stop method of all farm services", async () => {
    jest.useFakeTimers({ doNotFake: ["setTimeout", "setImmediate"] })
    const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
    await i.changeUserPlan(diamondPlan)

    const spyPublish = jest.spyOn(i.publisher, "publish")
    await promiseHandler(
      farmGamesController.handle({
        payload: { accountName: s.me.accountName, gamesID: [1090], userId: s.me.userId },
      })
    )
    await promiseHandler(
      farmGamesController.handle({
        payload: { accountName: s.me.accountName2, gamesID: [1090], userId: s.me.userId },
      })
    )
    jest.advanceTimersByTime(3600 * 1000 * 2)
    const spyFriendStopFarmAllAccounts = jest.spyOn(
      i.usersClusterStorage.getOrThrow(s.me.username),
      "stopFarmAllAccounts"
    )

    await promiseHandler(stopAllFarmsController.handle({ payload: { secret: "secret" } }))
    await new Promise(setImmediate)

    jest.useRealTimers()
  })

  test("2xUser -> 1 Account; should publish 2 usages of 2 hours", async () => {
    jest.useFakeTimers({ doNotFake: ["setTimeout", "setImmediate"] })
    const spyPublish = jest.spyOn(i.publisher, "publish")

    await promiseHandler(
      farmGamesController.handle({
        payload: { accountName: s.me.accountName, gamesID: [1090], userId: s.me.userId },
      })
    )
    await promiseHandler(
      farmGamesController.handle({
        payload: { accountName: s.friend.accountName, gamesID: [1090], userId: s.friend.userId },
      })
    )
    jest.advanceTimersByTime(3600 * 1000 * 2)

    await promiseHandler(stopAllFarmsController.handle({ payload: { secret: "secret" } }))

    const usagesCommands = spyPublish.mock.calls
      .filter(([call]) => call.operation === "user-complete-farm-session-usage")
      .flat(1)

    expect(usagesCommands).toHaveLength(2)
    const [meCommand, friendCommand] = usagesCommands as UserCompletedFarmSessionUsageCommand[]
    expect(meCommand.farmingAccountDetails).toStrictEqual([
      {
        accountName: s.me.accountName,
        status: "IDDLE",
        usageAmountInSeconds: 7200,
      },
    ])
    expect(friendCommand.farmingAccountDetails).toStrictEqual([
      {
        accountName: s.friend.accountName,
        status: "IDDLE",
        usageAmountInSeconds: 7200,
      },
    ])
    jest.useRealTimers()
  })

  test("2xUser -> 1 Account; should have persisted two new usages with 2 hours of usage", async () => {
    jest.useFakeTimers({ doNotFake: ["setTimeout", "setImmediate"] })
    const spyPublish = jest.spyOn(i.publisher, "publish")

    await promiseHandler(
      farmGamesController.handle({
        payload: { accountName: s.me.accountName, gamesID: [1090], userId: s.me.userId },
      })
    )
    await promiseHandler(
      farmGamesController.handle({
        payload: { accountName: s.friend.accountName, gamesID: [1090], userId: s.friend.userId },
      })
    )
    jest.advanceTimersByTime(3600 * 1000 * 2)

    await promiseHandler(stopAllFarmsController.handle({ payload: { secret: "secret" } }))
    await new Promise(setImmediate)

    console.log({
      observers: i.publisher.observers,
      calls: spyPublish.mock.calls,
    })

    const mePlan = await i.planRepository.getById(meInstances.me.plan.id_plan)
    expect(mePlan?.usages.data).toHaveLength(1)
    expect(mePlan?.usages.data[0].amountTime).toBe(7200)

    const friendPlan = await i.planRepository.getById(friendInstances.friend.plan.id_plan)
    expect(friendPlan?.usages.data).toHaveLength(1)
    expect(friendPlan?.usages.data[0].amountTime).toBe(7200)
    jest.useRealTimers()
  })
})
