import SteamUser from "steam-user"
import { connection } from "~/__tests__/connection"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  makeUserInstances,
  testUsers as s,
  validSteamAccounts,
} from "~/__tests__/instances"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = makeUserInstances("me", s.me, i.sacFactory)

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
}

beforeEach(async () => {
  jest.useFakeTimers({ doNotFake: ["setImmediate"] })
  await setupInstances({
    validSteamAccounts,
  })
})

afterAll(() => {
  jest.useRealTimers()
})

test("should store StateCache DTO with as farming with one game", async () => {
  const meCluster = i.userClusterBuilder.create(s.me.username, meInstances.me.plan)
  meCluster.addSAC(meInstances.meSAC)
  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  const stateCacheDTO = await i.sacStateCacheRepository.get(`${s.me.username}:${s.me.accountName}`)
  expect(stateCacheDTO?.accountName).toBe(s.me.accountName)
  expect(stateCacheDTO?.gamesPlaying).toStrictEqual([100])
  expect(stateCacheDTO?.isFarming).toBeTruthy()
})

test("should stop farming once interrupt occurs", async () => {
  const meCluster = i.userClusterBuilder.create(s.me.username, meInstances.me.plan)
  meCluster.addSAC(meInstances.meSAC)
  const pauseFarmOnAccountSPY = jest.spyOn(meCluster, "pauseFarmOnAccount")
  const sacClientSPY = jest.spyOn(meInstances.meSAC.client, "emit")
  const sacEmitterSPY = jest.spyOn(meInstances.meSAC.emitter, "emit")

  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
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
    [s.me.accountName]: "IDDLE",
  })
})

test("should start farm again when relog with state happens", async () => {
  const meCluster = i.userClusterBuilder.create(s.me.username, meInstances.me.plan)
  meCluster.addSAC(meInstances.meSAC)
  const pauseFarmOnAccountSPY = jest.spyOn(meCluster, "pauseFarmOnAccount")
  const sacClientSPY = jest.spyOn(meInstances.meSAC.client, "emit")
  const sacEmitterSPY = jest.spyOn(meInstances.meSAC.emitter, "emit")

  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  jest.advanceTimersByTime(500) // 2 hours
  await new Promise(setImmediate)

  const sacClientCalls = sacClientSPY.mock.calls
  expect(sacClientCalls[0]).toStrictEqual(["error", { eresult: SteamUser.EResult.NoConnection }])
  expect(sacClientCalls[1]).toStrictEqual(["webSession"])

  const sacEmitterCalls = sacEmitterSPY.mock.calls
  const sacState = { accountName: "paco", gamesPlaying: [100], isFarming: true }
  expect(sacEmitterCalls[0]).toStrictEqual(["interrupt", sacState])
  expect(sacEmitterCalls[1]).toStrictEqual(["hasSession"])
  expect(sacEmitterCalls[2]).toStrictEqual(["relog-with-state", sacState])
  expect(pauseFarmOnAccountSPY).toHaveBeenCalledTimes(1) // 1
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
})

test("should get back farming once has session again", async () => {
  const meCluster = i.userClusterBuilder.create(s.me.username, meInstances.me.plan)
  meCluster.addSAC(meInstances.meSAC)
  await meCluster.farmWithAccount(s.me.accountName, [100], meInstances.me.plan.id_plan)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
  jest.advanceTimersByTime(1000 * 3600 * 2) // 2 hours
  connection.emit("break")
  await new Promise(setImmediate)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "IDDLE",
  })
  jest.advanceTimersByTime(500)
  await new Promise(setImmediate)
  expect(meCluster.getAccountsStatus()).toStrictEqual({
    [s.me.accountName]: "FARMING",
  })
})
