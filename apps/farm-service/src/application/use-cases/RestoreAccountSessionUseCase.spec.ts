test("should ", async () => {
  expect(1).toBeTruthy()
})

import { AddSteamAccount } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  makeTestInstances,
  validSteamAccounts,
} from "~/__tests__/instances"
import { AddSteamAccountUseCase } from "~/application/use-cases/AddSteamAccountUseCase"
import { RestoreAccountSessionUseCase } from "~/application/use-cases/RestoreAccountSessionUseCase"

import { AddSteamAccountController, FarmGamesController } from "~/presentation/controllers"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {}
let restoreAccountSessionUseCase: RestoreAccountSessionUseCase
let addSteamAccountController: AddSteamAccountController
let farmGamesController: FarmGamesController

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  await Promise.all([
    i.createUser("me", { persistSteamAccounts: false }),
    // i.createUser("friend", { persistSteamAccounts: false }),
  ])
  const addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)
  // const addSteamAccountUseCase = new AddSteamAccountUseCase(
  //     addSteamAccount,
  //     i.allUsersClientsStorage,
  //     i.usersDAO,
  //     i.checkSteamAccountOwnerStatusUseCase
  // )

  // addSteamAccountController = new AddSteamAccountController(addSteamAccountUseCase)
  // restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(
  //     i.usersClusterStorage,
  //     i.sacStateCacheRepository
  // )

  // farmGamesController = new FarmGamesController({
  //     allUsersClientsStorage: i.allUsersClientsStorage,
  //     farmGamesUseCase: i.farmGamesUseCase,
  //     planRepository: i.planRepository,
  //     publisher: i.publisher,
  //     sacStateCacheRepository: i.sacStateCacheRepository,
  //     usersClusterStorage: i.usersClusterStorage,
  //     usersRepository: i.usersRepository,
  // })
}

describe("NOT MOBILE test suite", () => {
  beforeEach(async () => {
    await setupInstances({
      validSteamAccounts,
    })
  })

  test("should get FARM STARTED AT from state, not when it started", async () => {
    
  })
})
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
