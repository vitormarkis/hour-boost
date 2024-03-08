import {
  type 
  CustomInstances,
  type 
  MakeTestInstancesProps,
  type 
  PrefixKeys,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { RestoreAccountSessionUseCase } from "~/application/use-cases/RestoreAccountSessionUseCase"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

import { GuestPlan, type PlanUsage, Usage } from "core"
import {
  type 
  TEST_RestoreAccountConnection,
  makeRestoreAccountConnection,
} from "~/application/use-cases/__tests_helpers"
import { RestoreAccountConnectionUseCase } from "./RestoreAccountConnectionUseCase"

const log = console.log
// console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let restoreAccountSessionUseCase: RestoreAccountSessionUseCase
let restoreAccountConnectionUseCase: RestoreAccountConnectionUseCase
let restoreAccountConnection: TEST_RestoreAccountConnection

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  console.log = () => {}
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me")

  restoreAccountConnectionUseCase = new RestoreAccountConnectionUseCase(
    i.allUsersClientsStorage,
    i.usersClusterStorage,
    i.sacStateCacheRepository
  )
  restoreAccountConnection = makeRestoreAccountConnection(restoreAccountConnectionUseCase, i.usersRepository)
  restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(i.usersClusterStorage, i.publisher)
  console.log = log
}

describe("RestoreAccountSessionUseCase test suite", () => {
  beforeEach(async () => {
    await setupInstances({
      validSteamAccounts,
    })
  })

  test("should restore account session on application", async () => {
    await restoreAccountConnection(s.me.userId, s.me.accountName)
    const [error, result] = await restoreAccountSession(
      s.me.accountName,
      s.me.userId,
      meInstances.me.plan.id_plan,
      s.me.username
    )
    expect(error).toBeNull()
    expect(result?.code).toBe("SESSION-RESTORED")
  })

  test("should stop farm on cache in case attempt to start farm with max usage time plan expired", async () => {
    await restoreAccountConnection(s.me.userId, s.me.accountName)
    expect(meInstances.me.plan).toBeInstanceOf(GuestPlan)
    const usage = Usage.create({
      accountName: s.me.accountName,
      amountTime: 21600,
      createdAt: new Date(),
      plan_id: meInstances.me.plan.id_plan,
      user_id: s.me.userId,
    })
    meInstances.me.plan.use(usage)
    expect((meInstances.me.plan as PlanUsage).getUsageLeft()).toBe(0)
    await i.usersRepository.update(meInstances.me)
    const userPlan = (await i.planRepository.getById(meInstances.me.plan.id_plan))!
    expect((userPlan as PlanUsage).getUsageLeft()).toBe(0)

    const sac = i.allUsersClientsStorage.getAccountClient(s.me.userId, s.me.accountName)!
    const sacState = sac.getCache()
    sacState.farmGames([100])
    await i.sacStateCacheRepository.save(sacState)
    const state = await i.sacStateCacheRepository.get(s.me.accountName)
    expect(state?.isFarming()).toBe(true)
    expect(state?.gamesPlaying).toStrictEqual([100])

    const [error, result] = await restoreAccountSession(
      s.me.accountName,
      s.me.userId,
      meInstances.me.plan.id_plan,
      s.me.username
    )
    expect(result?.code).not.toBe("SESSION-RESTORED")
    expect(error).not.toBeNull()
    expect(error?.code).toStrictEqual("[FarmUsageService]:PLAN-MAX-USAGE-EXCEEDED")
  })
})

/**
 *
 * HELPERS
 */
async function restoreAccountSession(accountName: string, userId: string, planId: string, username: string) {
  const plan = (await i.planRepository.getById(planId))!
  const state = await i.sacStateCacheRepository.get(accountName)
  const sac = i.allUsersClientsStorage.getAccountClient(userId, accountName)!
  const res = restoreAccountSessionUseCase.execute({
    plan,
    sac,
    state,
    username,
  })

  return res
}

//
//     test.only("should NOT restore session if account is already logged", async () => {
//         const response = await promiseHandler(
//             addSteamAccountController.handle({
//                 payload: {
//                     accountName: s.me.accountName,
//                     password,
//                     userId: s.me.userId,
//                 },
//             })
//         )
//         ensureExpectation(201, response)

//         const sac = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
//         expect(sac.logged).toBe(true)

//         const steamAccount = await i.steamAccountsRepository.getByAccountName(s.me.accountName)
//         if (!steamAccount?.ownerId) throw "account not owned"
//         const user = await i.usersDAO.getByID(steamAccount.ownerId)
//         if (!user?.plan.id_plan) throw "user 404"
//         const plan = await i.planRepository.getById(user?.plan.id_plan)
//         if (!plan) throw "plan 404"
//         const { username } = user

//         const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
//             accountName: s.me.accountName,
//             plan,
//             sac,
//             username,
//         })
//         expect(errorRestoringSession).toBeNull()
//         if (errorRestoringSession) return
//         expect(result.code).toBe("ACCOUNT-IS-LOGGED-ALREADY")
//         // expect(result.).toBeTruthy()
//     })
// })

// describe("mobile test suite", () => {
//     beforeEach(async () => {
//         await setupInstances(
//             { validSteamAccounts },
//             { steamUserBuilder: new SteamUserMockBuilder(validSteamAccounts, true) }
//         )
//     })

//     test("should require steam guard", async () => {
//         const { status } = await promiseHandler(
//             addSteamAccountController.handle({
//                 payload: {
//                     accountName: s.me.accountName,
//                     password,
//                     userId: s.me.userId,
//                     authCode: "APSOD",
//                 },
//             })
//         )
//         expect(status).toBe(201)
//         connection.emit("break", { relog: false })

//         const steamAccount = await i.steamAccountsRepository.getByAccountName(s.me.accountName)
//         if (!steamAccount?.ownerId) throw "account not owned"
//         const user = await i.usersDAO.getByID(steamAccount.ownerId)
//         if (!user?.plan.id_plan) throw "user 404"
//         const plan = await i.planRepository.getById(user?.plan.id_plan)
//         if (!plan) throw "plan 404"
//         const { username } = user

//         const sac = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
//         expect(sac.logged).toBe(true)

//         const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
//             accountName: s.me.accountName,
//             plan,
//             sac,
//             username,
//         })
//         if (!errorRestoringSession) return
//         expect(errorRestoringSession.code).toBe("STEAM-GUARD")
//     })
// })
