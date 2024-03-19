import { PlanUsage } from "core"
import {
  makeTestInstances,
  password,
  validSteamAccounts,
  type CustomInstances,
  type MakeTestInstancesProps,
  type PrefixKeys,
} from "~/__tests__/instances"
import { ensureExpectation } from "~/__tests__/utils"
import { RestoreUsersSessionsUseCase } from "~/application/use-cases/RestoreUsersSessionsUseCase"
import { makeFarmGames } from "~/application/use-cases/__tests_helpers"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { getSACOn_AllUsersClientsStorage_ByUserId } from "~/utils/getSAC"
import { AddMoreGamesToPlanUseCase } from "./AddMoreGamesToPlanUseCase"
const log = console.log
// console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let addMoreGamesToPlanUseCase: AddMoreGamesToPlanUseCase

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.makeUserInstances("me", s.me)

  const [errorAddingAccount] = await i.addSteamAccountUseCase.execute({
    accountName: s.me.accountName,
    password,
    userId: s.me.userId,
  })
  expect(errorAddingAccount).toBeNull()
  // await i.usersRepository.update(meInstances.me)
  const restoreUsersSessionsUseCase = new RestoreUsersSessionsUseCase(i.usersClusterStorage)
  const users = await i.usersRepository.findMany()
  restoreUsersSessionsUseCase.execute({ users })

  // const farmGamesController = new FarmGamesController({
  //   allUsersClientsStorage: i.allUsersClientsStorage,
  //   farmGamesUseCase: i.farmGamesUseCase,
  //   usersRepository: i.usersRepository,
  // })
  addMoreGamesToPlanUseCase = new AddMoreGamesToPlanUseCase(
    i.usersRepository,
    i.allUsersClientsStorage,
    i.usersClusterStorage,
    i.sacStateCacheRepository,
    i.planRepository
  )
}

beforeEach(async () => {
  // console.log = () => {}
  await setupInstances({
    validSteamAccounts,
  })
  // console.log = log
})

test("should change usage plan to CUSTOM usage plan and increase max games allowed to 30", async () => {
  const userPlan = await i.planRepository.getById(meInstances.me.plan.id_plan)
  expect(userPlan).toBeInstanceOf(PlanUsage)
  expect(userPlan?.maxGamesAllowed).toBe(1)

  const [error] = await addMoreGamesToPlanUseCase.execute({
    mutatingUserId: s.me.userId,
    newMaxGamesAllowed: 30,
  })
  expect(error).toBeNull()

  const userPlan2 = await i.planRepository.getById(meInstances.me.plan.id_plan)
  expect(userPlan2?.custom).toBe(true)
  expect(userPlan2?.maxGamesAllowed).toBe(30)
})

test("should change from farming 30 games, to 2 games, and client should update so", async () => {
  const userKeys = i.allUsersClientsStorage.listUsersKeys()
  expect(userKeys).toStrictEqual(["id_123"])
  const [error] = await addMoreGamesToPlanUseCase.execute({
    mutatingUserId: s.me.userId,
    newMaxGamesAllowed: 30,
  })
  if (error && error.code === "LIST:ERROR-RESETING-FARM")
    console.log(error.payload.errorsList.flat(Number.POSITIVE_INFINITY))
  expect(error).toBeNull()

  const spy_clientGamesPlayed = import.meta.jest.spyOn(meInstances.meSAC.client, "gamesPlayed")
  expect(spy_clientGamesPlayed).not.toHaveBeenCalledWith(
    expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  )
  const farmGames = makeFarmGames(i.farmGamesController)
  const response = await farmGames(s.me.accountName, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], s.me.userId)
  ensureExpectation(200, response)
  expect(spy_clientGamesPlayed).toHaveBeenCalledWith(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))

  const [error2] = await addMoreGamesToPlanUseCase.execute({
    mutatingUserId: s.me.userId,
    newMaxGamesAllowed: 2,
  })
  const [, sac] = getSACOn_AllUsersClientsStorage_ByUserId(
    s.me.userId,
    i.allUsersClientsStorage
  )(s.me.accountName)
  const state = await i.sacStateCacheRepository.get(s.me.accountName)
  expect(sac?.getGamesPlaying()).toStrictEqual([1, 2])
  expect(state?.gamesPlaying).toStrictEqual([1, 2])
  expect(error2).toBeNull()
  expect(spy_clientGamesPlayed).toHaveBeenCalledWith([1, 2])
})
