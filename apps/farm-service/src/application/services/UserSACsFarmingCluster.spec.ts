import { SACStateCacheDTO } from "core"
import SteamUser from "steam-user"
import { connection } from "~/__tests__/connection"
import {
  CustomInstances,
  MakeTestInstancesProps,
  PrefixKeys,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
}

beforeEach(async () => {
  jest.useFakeTimers({ doNotFake: ["setImmediate", "nextTick"] })
  await setupInstances({
    validSteamAccounts,
  })
  await i.sacStateCacheRepository.flushAll()
})

afterAll(() => {
  jest.useRealTimers()
})

test("should store StateCache DTO with as farming with one game", async () => {
  i.allUsersClientsStorage.addSteamAccount(s.me.userId, meInstances.meSAC)
  const meCluster = i.userClusterBuilder.create(s.me.username, meInstances.me.plan)
  meCluster.addSAC(meInstances.meSAC)
  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  // await new Promise(res => meInstances.meSAC.emitter.setEventResolver("hasSession", res))
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  const stateCacheDTO = await i.sacStateCacheRepository.get(s.me.accountName)
  expect(stateCacheDTO?.accountName).toBe(s.me.accountName)
  expect(stateCacheDTO?.gamesPlaying).toStrictEqual([100])
  expect(stateCacheDTO?.isFarming).toBeTruthy()
})

test("should stop farming once interrupt occurs", async () => {
  jest.useFakeTimers({ doNotFake: ["setImmediate"] })

  const meCluster = i.userClusterBuilder.create(s.me.username, meInstances.me.plan)
  let xs = 0
  const sac = meInstances.meSAC
  sac.emitter.setEventResolver("interrupt", () => {
    console.log("TEST resolving")
    // res(true)
  })
  meCluster.addSAC(sac)
  const pauseFarmOnAccountSPY = jest.spyOn(meCluster, "pauseFarmOnAccount")
  const sacClientSPY = jest.spyOn(sac.client, "emit")
  const sacEmitterSPY = jest.spyOn(sac.emitter, "emit")

  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  jest.advanceTimersByTime(0)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
  // jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  // const resolver = () => {
  //   return new Promise(res => {
  //     meInstances.meSAC.emitter.setEventResolver("interrupt", res)
  //   })
  // }
  connection.emit("break")
  // await new Promise(setImmediate)
  await new Promise(res => {
    sac.emitter.setEventResolver("interrupt", () => {
      xs = 1
      res(true)
    })
  })
  expect(xs).toBe(1)

  const sacClientCalls = sacClientSPY.mock.calls
  expect(sacClientCalls[0]).toStrictEqual(["error", { eresult: SteamUser.EResult.NoConnection }])

  const sacEmitterCalls = sacEmitterSPY.mock.calls
  const sacState: SACStateCacheDTO = {
    accountName: "paco",
    gamesPlaying: [100],
    isFarming: true,
    planId: meInstances.me.plan.id_plan,
    username: s.me.username,
  }
  expect(sacEmitterCalls[0]).toStrictEqual(["interrupt", sacState])

  expect(pauseFarmOnAccountSPY).toHaveBeenCalledTimes(1) // 1
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "IDDLE",
  })
  console.log = () => {}
})

test("should start farm again when relog with state happens", async () => {
  console.log = log
  const meCluster = i.usersClusterStorage.getOrAdd(s.me.username, meInstances.me.plan)
  const sac = meInstances.meSAC
  meCluster.addSAC(sac)
  const pauseFarmOnAccountSPY = jest.spyOn(meCluster, "pauseFarmOnAccount")
  const sacClientSPY = jest.spyOn(sac.client, "emit")
  const sacEmitterSPY = jest.spyOn(sac.emitter, "emit")

  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  jest.advanceTimersByTime(500) // 2 hours
  await new Promise(res => sac.emitter.setEventResolver("relog-with-state", res))

  const sacClientCalls = sacClientSPY.mock.calls
  console.log({ sacClientCalls })
  expect(sacClientCalls[0]).toStrictEqual(["error", { eresult: SteamUser.EResult.NoConnection }])
  expect(sacClientCalls[1]).toStrictEqual(["webSession"])

  const sacEmitterCalls = sacEmitterSPY.mock.calls
  const sacState: SACStateCacheDTO = {
    accountName: "paco",
    gamesPlaying: [100],
    isFarming: true,
    planId: meInstances.me.plan.id_plan,
    username: s.me.username,
  }
  expect(sacEmitterCalls[0]).toStrictEqual(["interrupt", sacState])
  expect(sacEmitterCalls[1]).toStrictEqual(["hasSession"])
  expect(sacEmitterCalls[2]).toStrictEqual(["relog-with-state", sacState])
  expect(pauseFarmOnAccountSPY).toHaveBeenCalledTimes(1) // 1
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
})

test("should get back farming once has session again", async () => {
  console.log = log
  const meCluster = i.usersClusterStorage.getOrAdd(s.me.username, meInstances.me.plan)
  const sac = meInstances.meSAC
  const spySACEmitter = jest.spyOn(sac.emitter, "emit")
  meCluster.addSAC(sac)
  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  await new Promise(res => {
    sac.emitter.setEventResolver("interrupt", () => {
      res(true)
    })
  })
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "IDDLE",
  })
  jest.advanceTimersByTime(600)
  await new Promise(res => {
    sac.emitter.setEventResolver("relog-with-state", () => {
      res(true)
    })
  })
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
})
