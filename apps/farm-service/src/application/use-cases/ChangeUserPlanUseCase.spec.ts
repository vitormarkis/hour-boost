import { DiamondPlan, GuestPlan, SilverPlan, Usage } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  PrefixKeys,
  makeTestInstances,
  password,
  validSteamAccounts,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { FarmGamesController, StopFarmController } from "~/presentation/controllers"
import { isAccountFarmingOnClusterByUsername } from "~/utils/isAccount"
import { PlanBuilder } from "../factories/PlanFactory"
import { ChangeUserPlanUseCase } from "./ChangeUserPlanUseCase"
import { RemoveSteamAccountUseCase } from "./RemoveSteamAccountUseCase"
import { StopFarmUseCase } from "./StopFarmUseCase"
import { getAccountOnCache } from "~/utils/getAccount"
import { getSACOn_AllUsersClientsStorage_ByUserId } from "~/utils/getSAC"
import { RestoreAccountSessionUseCase } from "."

const log = console.log
// console.log = () => {}

// jest
//   .useFakeTimers({ doNotFake: ["setImmediate", "setTimeout", "setInterval"] })
//   .setSystemTime(new Date("2024-01-01T10:00:00.000Z"))
// jest.advanceTimersByTime(1000 * 3600 * 40)

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let changeUserPlanUseCase: ChangeUserPlanUseCase
let farmGamesController: FarmGamesController
let stopFarmController: StopFarmController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(i.usersClusterStorage, i.publisher)
  const removeSteamAccountUseCase = new RemoveSteamAccountUseCase(
    i.usersRepository,
    i.allUsersClientsStorage,
    i.sacStateCacheRepository,
    i.usersClusterStorage,
    i.planRepository,
    i.autoRestarterScheduler
  )
  changeUserPlanUseCase = new ChangeUserPlanUseCase(
    i.allUsersClientsStorage,
    i.usersRepository,
    i.planService,
    i.sacStateCacheRepository,
    removeSteamAccountUseCase,
    restoreAccountSessionUseCase,
    i.userService
  )

  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    farmGamesUseCase: i.farmGamesUseCase,
    usersRepository: i.usersRepository,
  })

  const stopFarmUseCase = new StopFarmUseCase(i.usersClusterStorage, i.planRepository)
  stopFarmController = new StopFarmController(stopFarmUseCase, i.usersRepository)
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should change user plan from guest to diamond", async () => {
  const user = await i.usersRepository.getByID(s.me.userId)
  expect(user?.plan).toBeInstanceOf(GuestPlan)
  if (!user) throw "no user"

  const [errorChangingUserPlan] = await changeUserPlanUseCase.execute({
    newPlanName: "DIAMOND",
    user,
  })
  expect(errorChangingUserPlan).toBeNull()

  const user2 = await i.usersRepository.getByID(s.me.userId)
  expect(user2?.plan).toBeInstanceOf(DiamondPlan)
})

test("should change user plan from silver to diamond", async () => {
  const silverPlan = new PlanBuilder(s.me.userId).infinity().silver()
  await i.changeUserPlan(silverPlan)
  const user = await i.usersRepository.getByID(s.me.userId)
  expect(user?.plan).toBeInstanceOf(SilverPlan)
  if (!user) throw "no user"

  const [errorChangingUserPlan] = await changeUserPlanUseCase.execute({
    newPlanName: "DIAMOND",
    user,
  })
  expect(errorChangingUserPlan).toBeNull()

  const user2 = await i.usersRepository.getByID(s.me.userId)
  expect(user2?.plan).toBeInstanceOf(DiamondPlan)
})

describe("user is farming test suite", () => {
  test("should trim farming games when downgrade the plan", async () => {
    const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
    await i.changeUserPlan(diamondPlan)

    const res_farmGames = await farmGames(s.me.accountName, [100, 200, 300, 400, 500], s.me.userId)
    expect(res_farmGames.status).toBe(200)

    const getAccountOnCacheImpl = getAccountOnCache(i.sacStateCacheRepository)

    const [error, isAccountFarming] = isAccountFarmingOnClusterByUsername(
      i.usersClusterStorage,
      s.me.username
    )(s.me.accountName)
    const gamesPlaying = (await getAccountOnCacheImpl(s.me.accountName))?.gamesPlaying
    expect(gamesPlaying).toHaveLength(5)
    expect(error).toBeNull()
    expect(isAccountFarming).toBe(true)

    const user = await i.usersRepository.getByID(s.me.userId)
    expect(user?.plan).toBeInstanceOf(DiamondPlan)
    if (!user) throw "no user"

    const [errorChangingUserPlan] = await changeUserPlanUseCase.execute({
      newPlanName: "GUEST",
      user,
    })
    const gamesPlaying2 = (await getAccountOnCacheImpl(s.me.accountName))?.gamesPlaying
    expect(gamesPlaying2).toHaveLength(1)
    expect(errorChangingUserPlan).toBeNull()

    const user2 = await i.usersRepository.getByID(s.me.userId)
    expect(user2?.plan).toBeInstanceOf(GuestPlan)
  })

  test("should trim out extra steam accounts when downgrade the plan", async () => {
    const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
    await i.changeUserPlan(diamondPlan)

    await i.addSteamAccount(s.me.userId, s.me.accountName2, password)
    expect(i.usersMemory.users.find(u => u.id_user === s.me.userId)?.steamAccounts.getAmount()).toBe(2)

    const res_farmGames = await farmGames(s.me.accountName, [100, 200, 300, 400, 500], s.me.userId)
    expect(res_farmGames.status).toBe(200)

    const res_farmGames2 = await farmGames(s.me.accountName2, [700], s.me.userId)
    expect(res_farmGames2.status).toBe(200)

    const getAccountOnCacheImpl = getAccountOnCache(i.sacStateCacheRepository)

    const [error, isAccountFarming] = isAccountFarmingOnClusterByUsername(
      i.usersClusterStorage,
      s.me.username
    )(s.me.accountName)
    const [error2, isAccountFarming2] = isAccountFarmingOnClusterByUsername(
      i.usersClusterStorage,
      s.me.username
    )(s.me.accountName2)
    const gamesPlaying = (await getAccountOnCacheImpl(s.me.accountName))?.gamesPlaying
    const gamesPlaying_acc2 = (await getAccountOnCacheImpl(s.me.accountName2))?.gamesPlaying
    expect(gamesPlaying).toHaveLength(5)
    expect(gamesPlaying_acc2).toHaveLength(1)
    expect(error).toBeNull()
    expect(error2).toBeNull()
    expect(isAccountFarming).toBe(true)
    expect(isAccountFarming2).toBe(true)

    const user = await i.usersRepository.getByID(s.me.userId)
    expect(user?.plan).toBeInstanceOf(DiamondPlan)
    if (!user) throw "no user"

    const [errorChangingUserPlan] = await changeUserPlanUseCase.execute({
      newPlanName: "GUEST",
      user,
    })
    expect(errorChangingUserPlan).toBeNull()
    const gamesPlaying2 = (await getAccountOnCacheImpl(s.me.accountName))?.gamesPlaying
    expect(gamesPlaying2).toHaveLength(1)
    const accountOnCache = await getAccountOnCacheImpl(s.me.accountName2)
    expect(accountOnCache).toBeNull()

    const user2 = await i.usersRepository.getByID(s.me.userId)
    expect(user2?.steamAccounts.getAmount()).toBe(1)
  })

  test("should NOT has extra games farming after downgrade the plan", async () => {
    const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
    await i.changeUserPlan(diamondPlan)

    const res_farmGames = await farmGames(s.me.accountName, [100, 200, 300, 400, 500], s.me.userId)
    expect(res_farmGames.status).toBe(200)

    const user = await i.usersRepository.getByID(s.me.userId)
    expect(user?.plan).toBeInstanceOf(DiamondPlan)
    if (!user) throw "no user"

    const [errorChangingUserPlan] = await changeUserPlanUseCase.execute({
      newPlanName: "GUEST",
      user,
    })
    expect(errorChangingUserPlan).toBeNull()

    const [errorGettingSac, sac] = getSACOn_AllUsersClientsStorage_ByUserId(
      s.me.userId,
      i.allUsersClientsStorage
    )(s.me.accountName)
    expect(errorGettingSac).toBeNull()
    expect(sac?.getGamesPlaying()).toStrictEqual([100])
  })

  test("should persist usages of trimmed steam account", async () => {
    jest.useFakeTimers({ doNotFake: ["setTimeout"] }).setSystemTime(new Date("2024-01-10T10:00:00.000Z"))
    const diamondPlan = new PlanBuilder(s.me.userId).infinity().diamond()
    const user1 = await i.usersRepository.getByID(s.me.userId)
    expect(user1?.usages.data).toStrictEqual([])

    await i.changeUserPlan(diamondPlan)
    await i.addSteamAccount(s.me.userId, s.me.accountName2, password)

    const res_farmGames = await farmGames(s.me.accountName, [100, 200, 300, 400, 500], s.me.userId)
    expect(res_farmGames.status).toBe(200)

    const res_farmGames2 = await farmGames(s.me.accountName2, [700], s.me.userId)
    expect(res_farmGames2.status).toBe(200)

    const user = await i.usersRepository.getByID(s.me.userId)
    if (!user) throw "no user"

    jest.advanceTimersByTime(1000 * 60)

    const [errorChangingUserPlan] = await changeUserPlanUseCase.execute({
      newPlanName: "GUEST",
      user,
    })
    expect(errorChangingUserPlan).toBeNull()

    const user2 = await i.usersRepository.getByID(s.me.userId)
    expect(user2?.usages.data).toHaveLength(1)
    expect(user2?.usages.data[0]).toStrictEqual(
      expect.objectContaining({
        accountName: s.me.accountName2,
        amountTime: 60,
        createdAt: new Date("2024-01-10T10:01:00.000Z"),
      })
    )
    jest.useRealTimers()
  })
})

export function farmGames(accountName: string, gamesID: number[], userId: string) {
  return farmGamesController.handle({
    payload: {
      accountName,
      gamesID,
      userId,
    },
  })
}
