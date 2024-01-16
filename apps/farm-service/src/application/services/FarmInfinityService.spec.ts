import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { PlanBuilder } from "~/application/factories/PlanFactory"
import { FarmGamesUseCase } from "~/application/use-cases/FarmGamesUseCase"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { FarmGamesController, StopFarmController, promiseHandler } from "~/presentation/controllers"

const log = console.log
// console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should ", async () => {
  const today = new Date("2024-01-12T10:00:00.000Z")
  jest.useFakeTimers({ doNotFake: ["setTimeout"] }).setSystemTime(today)
  await i.createUser("me")

  const plan = new PlanBuilder(s.me.userId).infinity().diamond()
  await i.changeUserPlan(plan)

  const farmGamesUseCase = new FarmGamesUseCase(i.usersClusterStorage)

  const farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    farmGamesUseCase,
    planRepository: i.planRepository,
    publisher: i.publisher,
    sacStateCacheRepository: i.sacStateCacheRepository,
    usersClusterStorage: i.usersClusterStorage,
    usersRepository: i.usersRepository,
  })

  const { status, json } = await promiseHandler(
    farmGamesController.handle({
      payload: {
        accountName: s.me.accountName,
        gamesID: [100],
        userId: s.me.userId,
      },
    })
  )
  expect(status).toBeLessThan(300)
  const cacheState = await i.sacStateCacheRepository.get(s.me.accountName)
  expect(cacheState?.farmStartedAt).toBe(today.getTime())

  /**
   * Stop farm
   */
  const stopFarmController = new StopFarmController(
    i.usersClusterStorage,
    i.usersRepository,
    i.planRepository
  )
  await promiseHandler(
    stopFarmController.handle({
      payload: {
        accountName: s.me.accountName,
        userId: s.me.userId,
      },
    })
  )

  const cacheState2 = await i.sacStateCacheRepository.get(s.me.accountName)
  expect(cacheState2?.farmStartedAt).toBe(null)

  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  const after = new Date("2024-01-12T12:00:00.000Z")

  // console.log = log

  /**
   * Farm again
   */

  const res = await promiseHandler(
    farmGamesController.handle({
      payload: {
        accountName: s.me.accountName,
        gamesID: [100],
        userId: s.me.userId,
      },
    })
  )
  expect(res.status).toBeLessThan(300)
  const cacheState3 = await i.sacStateCacheRepository.get(s.me.accountName)
  expect(cacheState3?.farmStartedAt).toBe(after.getTime())
})
