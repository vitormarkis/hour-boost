import { CreateUser, PlanRepository, SteamAccountClientStateCacheRepository, User } from "core"
import { create } from "domain"
import SteamUser from "steam-user"
import { makeSACFactory, makeUserClusterFactory } from "~/__tests__/factories"
import { FarmServiceFactory } from "~/application/factories"
import { EventEmitter, UserSACsFarmingCluster, UsersSACsFarmingClusterStorage } from "~/application/services"
import { SteamAccountClient } from "~/application/services/steam"
import { SteamBuilder } from "~/contracts"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryInMemory,
  SteamAccountClientStateCacheInMemory,
  UsersInMemory,
  UsersRepositoryInMemory,
} from "~/infra/repository"
import { SteamUserMock } from "~/infra/services"
import { makeUser } from "~/utils/makeUser"

const log = console.log
// console.log = () => { }

const validSteamAccounts = [
  { accountName: "paco", password: "123" },
  { accountName: "mathx99", password: "123" },
]

const ME_ID = "123"
const ME_ACCOUNTNAME = "paco"
const ME_ACCOUNTNAME_2 = "fred"
const ME_USERNAME = "vrsl"

const MATH_ID = "_123"
const MATH_ACCOUNTNAME = "mathx99"
const MATH_USERNAME = "math"

let sut: UsersSACsFarmingClusterStorage
let steamBuilder: SteamBuilder
let usersMemory: UsersInMemory
let publisher: Publisher
let usersRepository: UsersRepositoryInMemory
let sacStateCacheRepository: SteamAccountClientStateCacheRepository
let planRepository: PlanRepository
let me: User
let math: User
let meCluster: UserSACsFarmingCluster
let mathCluster: UserSACsFarmingCluster
let makeUserCluster: (user: User) => UserSACsFarmingCluster
let makeSac: (user: User, accountName: string) => SteamAccountClient

beforeEach(async () => {
  jest.useFakeTimers()
  sut = new UsersSACsFarmingClusterStorage()
  steamBuilder = {
    create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
  }
  publisher = new Publisher()
  usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  planRepository = new PlanRepositoryInMemory(usersMemory)
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  me = makeUser(ME_ID, ME_USERNAME)
  math = makeUser(MATH_ID, MATH_USERNAME)
  makeUserCluster = makeUserClusterFactory(publisher, sacStateCacheRepository, planRepository)
  makeSac = makeSACFactory(validSteamAccounts, publisher)
  meCluster = makeUserCluster(me)
  mathCluster = makeUserCluster(math)
  await usersRepository.create(me)
  await usersRepository.create(math)
})

afterAll(() => {
  jest.useRealTimers()
})

export const emitterBuilder = {
  create: () => new EventEmitter(),
}

describe("List test suite", () => {
  test("should list one account iddle after pausing farm", async () => {
    sut.add(me.username, meCluster)
    const me_accountName_sac = makeSac(me, ME_ACCOUNTNAME)
    meCluster.addSAC(me_accountName_sac)
    await meCluster.farmWithAccount(ME_ACCOUNTNAME, [109], me.plan.id_plan)
    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meCluster.pauseFarmOnAccount(ME_ACCOUNTNAME)
    const accountStatus = sut.getAccountsStatus()
    expect(accountStatus).toStrictEqual({
      vrsl: {
        paco: "IDDLE",
      },
    })
  })

  test("should LIST two farming accounts", async () => {
    const me_accountName_sac = makeSac(me, ME_ACCOUNTNAME)
    const math_accountName_sac = makeSac(math, MATH_ACCOUNTNAME)
    sut.add(me.username, meCluster)
    sut.add(math.username, mathCluster)
    meCluster.addSAC(me_accountName_sac)
    mathCluster.addSAC(math_accountName_sac)
    await meCluster.farmWithAccount(ME_ACCOUNTNAME, [109], me.plan.id_plan)
    await mathCluster.farmWithAccount(MATH_ACCOUNTNAME, [109], math.plan.id_plan)
    const accountStatus = sut.getAccountsStatus()
    expect(accountStatus).toStrictEqual({
      vrsl: {
        paco: "FARMING",
      },
      math: {
        mathx99: "FARMING",
      },
    })
  })

  test("should create new farm service", async () => {
    const spy_planRepository_getById = jest.spyOn(planRepository, "getById")
    const spy_meCluster_setFarmService = jest.spyOn(meCluster, "setFarmService")
    const me_accountName_sac = makeSac(me, ME_ACCOUNTNAME)
    const me_accountName2_sac = makeSac(me, ME_ACCOUNTNAME_2)
    sut.add(me.username, meCluster)
    meCluster.addSAC(me_accountName_sac)
    meCluster.addSAC(me_accountName2_sac)

    expect(spy_meCluster_setFarmService).toHaveBeenCalledTimes(0)
    // 1 conta, busca plano
    await meCluster.farmWithAccount(ME_ACCOUNTNAME, [109], me.plan.id_plan)
    expect(spy_meCluster_setFarmService).toHaveBeenCalledTimes(1)
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(1)
    expect(spy_planRepository_getById).toHaveBeenCalledWith(me.plan.id_plan)

    // 2 contas, usa plano existente
    await meCluster.farmWithAccount(ME_ACCOUNTNAME_2, [109], me.plan.id_plan)
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meCluster.pauseFarmOnAccount(ME_ACCOUNTNAME)

    // 2 contas, usa plano existente, chamando o ME_ACCOUNTNAME
    await meCluster.farmWithAccount(ME_ACCOUNTNAME, [109], me.plan.id_plan)
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meCluster.pauseFarmOnAccount(ME_ACCOUNTNAME)
    meCluster.pauseFarmOnAccount(ME_ACCOUNTNAME_2)

    // 0 contas, farm novo, busca plano
    await meCluster.farmWithAccount(ME_ACCOUNTNAME_2, [109], me.plan.id_plan)
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(2)
    expect(spy_meCluster_setFarmService).toHaveBeenCalledTimes(2)
  })
})
