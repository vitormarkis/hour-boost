import { jest } from "@jest/globals"
import { CustomInstances, MakeTestInstancesProps, makeTestInstances } from "~/__tests__/instances"
import { UsersSACsFarmingClusterStorage } from "~/application/services/UsersSACsFarmingClusterStorage"
// console.log = () => { }
import { PrefixKeys } from "~/__tests__/instances"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

const validSteamAccounts = [
  { accountName: "paco", password: "123" },
  { accountName: "mathx99", password: "123" },
]

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let friendInstances = {} as PrefixKeys<"friend">
let usersClusterStorage: UsersSACsFarmingClusterStorage

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")
  friendInstances = await i.createUser("friend")
  usersClusterStorage = new UsersSACsFarmingClusterStorage(i.userClusterBuilder)
}

beforeEach(async () => {
  jest.useFakeTimers({ doNotFake: ["setTimeout"] })
  await setupInstances({
    validSteamAccounts,
  })
})

afterAll(() => {
  jest.useRealTimers()
})

describe("List test suite", () => {
  test.only("should list one account iddle after pausing farm", async () => {
    // const meCluster = i.userClusterBuilder.create(s.me.username, meInstances.me.plan)
    const meCluster = usersClusterStorage.add(s.me.username, meInstances.me.plan)
    meCluster.addSAC(meInstances.meSAC)
    await meCluster.farmWithAccount({
      accountName: s.me.accountName,
      gamesId: [109],
      planId: meInstances.me.plan.id_plan,
      session: {
        type: "NEW",
      },
    })
    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meCluster.pauseFarmOnAccount({ accountName: s.me.accountName, isFinalizingSession: true })
    const accountStatus = usersClusterStorage.getAccountsStatus()
    expect(accountStatus).toStrictEqual({
      user_vrsl: {
        paco: "IDDLE",
      },
    })
  })

  test.only("should LIST two farming accounts", async () => {
    // console.log = log
    // console.log(await i.planRepository.list())
    const meCluster = usersClusterStorage.add(s.me.username, meInstances.me.plan)
    meCluster.addSAC(meInstances.meSAC)
    const friendCluster = usersClusterStorage.add(s.friend.username, friendInstances.friend.plan)
    friendCluster.addSAC(friendInstances.friendSAC)
    await meCluster.farmWithAccount({
      accountName: s.me.accountName,
      gamesId: [109],
      planId: meInstances.me.plan.id_plan,
      session: {
        type: "NEW",
      },
    })
    await friendCluster.farmWithAccount({
      accountName: s.friend.accountName,
      gamesId: [109],
      planId: friendInstances.friend.plan.id_plan,
      session: {
        type: "NEW",
      },
    })
    const accountStatus = usersClusterStorage.getAccountsStatus()
    expect(accountStatus).toStrictEqual({
      [s.me.username]: {
        [s.me.accountName]: "FARMING",
      },
      [s.friend.username]: {
        [s.friend.accountName]: "FARMING",
      },
    })
  })

  test.only("should create new farm service", async () => {
    const spy_planRepository_getById = jest.spyOn(i.planRepository, "getById")
    const meCluster = usersClusterStorage.add(s.me.username, meInstances.me.plan)
    const spy_meCluster_setFarmService = jest.spyOn(meCluster, "setFarmService")
    meCluster.addSAC(meInstances.meSAC)
    meCluster.addSAC(meInstances.meSAC2)

    expect(spy_meCluster_setFarmService).toHaveBeenCalledTimes(0)
    // 1 conta, busca plano
    await meCluster.farmWithAccount({
      accountName: s.me.accountName,
      gamesId: [109],
      planId: meInstances.me.plan.id_plan,
      session: {
        type: "NEW",
      },
    })
    expect(spy_meCluster_setFarmService).toHaveBeenCalledTimes(1)
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(1)
    expect(spy_planRepository_getById).toHaveBeenCalledWith(meInstances.me.plan.id_plan)

    // 2 contas, usa plano existente
    await meCluster.farmWithAccount({
      accountName: s.me.accountName2,
      gamesId: [109],
      planId: meInstances.me.plan.id_plan,
      session: {
        type: "NEW",
      },
    })
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meCluster.pauseFarmOnAccount({ accountName: s.me.accountName, isFinalizingSession: true })

    // 2 contas, usa plano existente, chamando o s.me.accountName
    await meCluster.farmWithAccount({
      accountName: s.me.accountName,
      gamesId: [109],
      planId: meInstances.me.plan.id_plan,
      session: {
        type: "NEW",
      },
    })
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(1000 * 60) // 1 minute
    meCluster.pauseFarmOnAccount({ accountName: s.me.accountName, isFinalizingSession: true })
    meCluster.pauseFarmOnAccount({ accountName: s.me.accountName2, isFinalizingSession: true })

    // 0 contas, farm novo, busca plano
    await meCluster.farmWithAccount({
      accountName: s.me.accountName2,
      gamesId: [109],
      planId: meInstances.me.plan.id_plan,
      session: {
        type: "NEW",
      },
    })
    expect(spy_planRepository_getById).toHaveBeenCalledTimes(2)
    expect(spy_meCluster_setFarmService).toHaveBeenCalledTimes(2)
  })
})
