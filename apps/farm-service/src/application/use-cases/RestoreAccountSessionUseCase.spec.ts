import { AddSteamAccount } from "core"
import { connection } from "~/__tests__/connection"
import {
  makeTestInstances,
  validSteamAccounts,
  MakeTestInstancesProps,
  CustomInstances,
  password,
} from "~/__tests__/instances"
import { AddSteamAccountUseCase } from "~/application/use-cases/AddSteamAccountUseCase"
import { RestoreAccountSessionUseCase } from "~/application/use-cases/RestoreAccountSessionUseCase"

import { testUsers as s, setPlayingSession } from "~/infra/services/UserAuthenticationInMemory"
import { AddSteamAccountController, FarmGamesController, promiseHandler } from "~/presentation/controllers"
import { SteamUserMockBuilder } from "~/utils/builders"

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
  const addSteamAccountUseCase = new AddSteamAccountUseCase(
    addSteamAccount,
    i.allUsersClientsStorage,
    i.usersDAO,
    i.checkSteamAccountOwnerStatusUseCase
  )

  addSteamAccountController = new AddSteamAccountController(addSteamAccountUseCase)
  restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(
    i.steamAccountsRepository,
    i.allUsersClientsStorage,
    i.usersDAO,
    i.usersClusterStorage,
    i.sacStateCacheRepository
  )

  farmGamesController = new FarmGamesController({
    allUsersClientsStorage: i.allUsersClientsStorage,
    farmGamesUseCase: i.farmGamesUseCase,
    planRepository: i.planRepository,
    publisher: i.publisher,
    sacStateCacheRepository: i.sacStateCacheRepository,
    usersClusterStorage: i.usersClusterStorage,
    usersRepository: i.usersRepository,
  })
}

describe("NOT MOBILE test suite", () => {
  beforeEach(async () => {
    await setupInstances({
      validSteamAccounts,
    })
  })

  test("should NOT restore session if account is already logged", async () => {
    const { status } = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: s.me.accountName,
          password,
          userId: s.me.userId,
        },
      })
    )

    const sac = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
    expect(sac.logged).toBe(true)

    const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
      accountName: s.me.accountName,
    })
    expect(errorRestoringSession).toBeNull()
    if (errorRestoringSession) return
    expect(result.code).toBe("ACCOUNT-IS-LOGGED-ALREADY")
    expect(result.fatal).toBeTruthy()
  })

  test("should restore session successfully", async () => {
    console.log = log
    const { status } = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: s.me.accountName,
          password,
          userId: s.me.userId,
        },
      })
    )
    expect(status).toBe(201)

    connection.emit("break")
    await i.sacStateCacheRepository.deleteAllEntriesFromAccount(s.me.accountName)
    const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
      accountName: s.me.accountName,
    })
    expect(errorRestoringSession).toBeNull()
    if (errorRestoringSession) return
    expect(result.code).toBe("ACCOUNT-RELOGGED::CREDENTIALS")
    expect(result.fatal).toBeTruthy()
  })

  test("should restore session with state successfully", async () => {
    const res_addSteamAccount = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: s.me.accountName,
          password,
          userId: s.me.userId,
        },
      })
    )
    expect(res_addSteamAccount.status).toBe(201)

    const res_farmGamesOnAccount = await promiseHandler(
      farmGamesController.handle({
        payload: {
          accountName: s.me.accountName,
          gamesID: [707],
          userId: s.me.userId,
        },
      })
    )
    expect(res_farmGamesOnAccount.status).toBe(200)

    connection.emit("break")
    const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
      accountName: s.me.accountName,
    })
    expect(errorRestoringSession).toBeNull()
    if (errorRestoringSession) return
    expect(result.code).toBe("ACCOUNT-RELOGGED::TOKEN")
    expect(result.fatal).toBeTruthy()
  })

  test("should not stop cron when other session is playing", async () => {
    const { status } = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: s.me.accountName,
          password,
          userId: s.me.userId,
        },
      })
    )
    expect(status).toBe(201)

    connection.emit("break", { relog: false })
    setPlayingSession([s.me.accountName])
    const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
      accountName: s.me.accountName,
    })
    setPlayingSession([])
    if (!errorRestoringSession) return
    expect(errorRestoringSession.code).toBe("OTHER-SESSION-STILL-ON")
  })

  test("should not stop cron when other session is playing", async () => {
    const { status } = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: s.me.accountName,
          password,
          userId: s.me.userId,
        },
      })
    )
    expect(status).toBe(201)

    connection.emit("break", { relog: false })
    setPlayingSession([s.me.accountName])
    const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
      accountName: s.me.accountName,
    })
    setPlayingSession([])
    if (!errorRestoringSession) return
    expect(errorRestoringSession.code).toBe("OTHER-SESSION-STILL-ON")
  })
})

describe("mobile test suite", () => {
  beforeEach(async () => {
    await setupInstances(
      { validSteamAccounts },
      { steamUserBuilder: new SteamUserMockBuilder(validSteamAccounts, true) }
    )
  })

  test("should require steam guard", async () => {
    const { status } = await promiseHandler(
      addSteamAccountController.handle({
        payload: {
          accountName: s.me.accountName,
          password,
          userId: s.me.userId,
          authCode: "APSOD",
        },
      })
    )
    expect(status).toBe(201)
    connection.emit("break", { relog: false })
    const [errorRestoringSession, result] = await restoreAccountSessionUseCase.execute({
      accountName: s.me.accountName,
    })
    if (!errorRestoringSession) return
    expect(errorRestoringSession.code).toBe("STEAM-GUARD")
  })
})
