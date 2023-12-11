import { PlanRepository, SteamAccountClientStateCacheRepository, User } from "core"
import { connection } from "~/__tests__/connection"
import { makeSACFactory, makeUserClusterFactory } from "~/__tests__/factories"
import { validSteamAccounts } from "~/__tests__/validSteamAccounts"
import { Publisher } from "~/infra/queue"
import {
  PlanRepositoryInMemory,
  SteamAccountClientStateCacheInMemory,
  UsersInMemory,
} from "~/infra/repository"
import { makeUser } from "~/utils/makeUser"
import "dotenv/config"
import SteamUser from "steam-user"

const log = console.log

export const _me = {
  id: "123",
  username: "vrsl",
  accountName: "paco",
}

let usersMemory: UsersInMemory
let publisher: Publisher
let sacStateCacheRepository: SteamAccountClientStateCacheRepository
let planRepository: PlanRepository
let me: User

let makeSAC: ReturnType<typeof makeSACFactory>
let makeUserCluster: ReturnType<typeof makeUserClusterFactory>

beforeEach(() => {
  console.log = () => {}
  jest.useFakeTimers({ doNotFake: ["setImmediate"] })
  usersMemory = new UsersInMemory()
  publisher = new Publisher()
  sacStateCacheRepository = new SteamAccountClientStateCacheInMemory()
  planRepository = new PlanRepositoryInMemory(usersMemory)
  me = makeUser(_me.id, _me.username)
  usersMemory.users.push(me)
  makeSAC = makeSACFactory(validSteamAccounts, publisher)
  makeUserCluster = makeUserClusterFactory(publisher, sacStateCacheRepository, planRepository)
})

afterAll(() => {
  jest.useRealTimers()
})

test("should store StateCache DTO with as farming with one game", async () => {
  const meCluster = makeUserCluster(me)
  const sac = makeSAC(me, _me.accountName)
  meCluster.addSAC(sac)
  await meCluster.farmWithAccount(_me.accountName, [100], me.plan.id_plan)
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  const stateCacheDTO = await sacStateCacheRepository.get(`${_me.username}:${_me.accountName}`)
  expect(stateCacheDTO?.accountName).toBe(_me.accountName)
  expect(stateCacheDTO?.gamesPlaying).toStrictEqual([100])
  expect(stateCacheDTO?.isFarming).toBeTruthy()
})

test("should stop farming once interrupt occurs", async () => {
  const meCluster = makeUserCluster(me)
  const sac = makeSAC(me, _me.accountName)
  const pauseFarmOnAccountSPY = jest.spyOn(meCluster, "pauseFarmOnAccount")
  const sacClientSPY = jest.spyOn(sac.client, "emit")
  const sacEmitterSPY = jest.spyOn(sac.emitter, "emit")

  meCluster.addSAC(sac)
  await meCluster.farmWithAccount(_me.accountName, [100], me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [_me.accountName]: "FARMING",
  })
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  await new Promise(setImmediate)

  const sacClientCalls = sacClientSPY.mock.calls
  expect(sacClientCalls[0]).toStrictEqual(["error", { eresult: SteamUser.EResult.NoConnection }])

  const sacEmitterCalls = sacEmitterSPY.mock.calls
  const sacState = { accountName: "paco", gamesPlaying: [100], isFarming: true }
  expect(sacEmitterCalls[0]).toStrictEqual(["interrupt", sacState])

  expect(pauseFarmOnAccountSPY).toHaveBeenCalledTimes(1) // 1
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [_me.accountName]: "IDDLE",
  })
})

test("should start farm again when relog with state happens", async () => {
  const meCluster = makeUserCluster(me)
  const sac = makeSAC(me, _me.accountName)
  const pauseFarmOnAccountSPY = jest.spyOn(meCluster, "pauseFarmOnAccount")
  const sacClientSPY = jest.spyOn(sac.client, "emit")
  const sacEmitterSPY = jest.spyOn(sac.emitter, "emit")

  meCluster.addSAC(sac)
  await meCluster.farmWithAccount(_me.accountName, [100], me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [_me.accountName]: "FARMING",
  })
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  jest.advanceTimersByTime(500) // 2 hours
  await new Promise(setImmediate)

  const sacClientCalls = sacClientSPY.mock.calls
  expect(sacClientCalls[0]).toStrictEqual(["error", { eresult: SteamUser.EResult.NoConnection }])
  expect(sacClientCalls[1]).toStrictEqual(["webSession"])

  const sacEmitterCalls = sacEmitterSPY.mock.calls
  // console.log = log
  // console.log(sacEmitterCalls)
  // console.log = () => { }
  const sacState = { accountName: "paco", gamesPlaying: [100], isFarming: true }
  expect(sacEmitterCalls[0]).toStrictEqual(["interrupt", sacState])
  expect(sacEmitterCalls[1]).toStrictEqual(["hasSession"])
  expect(sacEmitterCalls[2]).toStrictEqual(["relog-with-state", sacState])
  expect(pauseFarmOnAccountSPY).toHaveBeenCalledTimes(1) // 1
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [_me.accountName]: "FARMING",
  })
})

test("should get back farming once has session again", async () => {
  const meCluster = makeUserCluster(me)
  const sac = makeSAC(me, _me.accountName)
  meCluster.addSAC(sac)
  await meCluster.farmWithAccount(_me.accountName, [100], me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [_me.accountName]: "FARMING",
  })
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  await new Promise(setImmediate)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [_me.accountName]: "IDDLE",
  })
  jest.advanceTimersByTime(500)
  await new Promise(setImmediate)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [_me.accountName]: "FARMING",
  })
})
