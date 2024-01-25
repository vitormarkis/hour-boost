import { AddSteamAccount } from "core"
import { connection } from "~/__tests__/connection"
import {
  makeTestInstances,
  validSteamAccounts,
  MakeTestInstancesProps,
  CustomInstances,
  password,
} from "~/__tests__/instances"
import {
  AddSteamAccountUseCase,
  CheckSteamAccountOwnerStatusUseCase,
  ScheduleAutoReloginUseCase,
} from "~/application/use-cases"
import { RestoreAccountSessionUseCase } from "~/application/use-cases/RestoreAccountSessionUseCase"
import { AutoReloginScheduler } from "~/domain/cron"

import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"
import { AddSteamAccountController } from "~/presentation/controllers"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {}
let scheduleAutoReloginUseCase: ScheduleAutoReloginUseCase

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me", { persistSteamAccounts: false })

  const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(
    i.steamAccountsRepository,
    i.allUsersClientsStorage,
    i.usersDAO,
    i.usersClusterStorage,
    i.sacStateCacheRepository
  )
  scheduleAutoReloginUseCase = new ScheduleAutoReloginUseCase(
    i.autoReloginScheduler,
    restoreAccountSessionUseCase
  )
}

describe("ScheduleAutoReloginUseCase test suite", () => {
  beforeEach(async () => {
    console.log = () => {}
    await setupInstances({
      validSteamAccounts,
    })
    console.log = log
  })
  test("should schedule a new auto relogin cron", async () => {
    const [errorScheduling] = await scheduleAutoReloginUseCase.execute({ accountName: s.me.accountName })
    expect(errorScheduling).toBe(null)
  })

  test("should error if there is already a cron for this account", async () => {
    const [errorScheduling] = await scheduleAutoReloginUseCase.execute({ accountName: s.me.accountName })
    expect(errorScheduling).toBe(null)
    const [errorSchedulingForSecondTime] = await scheduleAutoReloginUseCase.execute({
      accountName: s.me.accountName,
    })
    expect(errorSchedulingForSecondTime?.code).toBe("ALREADY-HAS-CRON")
  })

  test("should call resolve on asking for steam guard, and log once user add steam guard", async () => {
    jest.useFakeTimers({ doNotFake: ["setTimeout", "setImmediate", "clearInterval", "nextTick"] })
    const addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)
    const checkSteamAccountOwnerStatusUseCase = new CheckSteamAccountOwnerStatusUseCase(
      i.steamAccountsRepository
    )
    const addSteamAccountUseCase = new AddSteamAccountUseCase(
      addSteamAccount,
      i.allUsersClientsStorage,
      i.usersDAO,
      checkSteamAccountOwnerStatusUseCase
    )
    const [errorAddingAccount] = await addSteamAccountUseCase.execute({
      accountName: s.me.accountName,
      password: password,
      userId: s.me.userId,
    })
    expect(errorAddingAccount).toBeNull()

    const sac = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
    expect(sac.logged).toBe(true)
    connection.emit("break", { relog: false, replaceRefreshToken: true })
    expect(sac.logged).toBe(false)

    console.log = log
    const [errorScheduling] = await scheduleAutoReloginUseCase.execute({
      accountName: s.me.accountName,
      intervalInSeconds: 5,
    })
    expect(errorScheduling).toBe(null)
    expect(sac.logged).toBe(false)
    jest.advanceTimersByTime(1000 * 5)
    await new Promise(res => setTimeout(res, 400))
    expect(sac.logged).toBe(true)
  })

  test("should relog sac with refresh token", async () => {
    jest.useFakeTimers({ doNotFake: ["setTimeout", "setImmediate"] })
    const addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)
    const checkSteamAccountOwnerStatusUseCase = new CheckSteamAccountOwnerStatusUseCase(
      i.steamAccountsRepository
    )
    const addSteamAccountUseCase = new AddSteamAccountUseCase(
      addSteamAccount,
      i.allUsersClientsStorage,
      i.usersDAO,
      checkSteamAccountOwnerStatusUseCase
    )
    const [errorAddingAccount] = await addSteamAccountUseCase.execute({
      accountName: s.me.accountName,
      password: password,
      userId: s.me.userId,
      authCode: "12345",
    })
    expect(errorAddingAccount).toBeNull()

    console.log = log
    const sac = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
    const accountRefreshToken = await i.sacStateCacheRepository.getRefreshToken(s.me.accountName)
    expect(accountRefreshToken).toBeTruthy()
    expect(sac.logged).toBe(true)
    connection.emit("break", { relog: false })
    expect(sac.logged).toBe(false)
    const [errorScheduling] = await scheduleAutoReloginUseCase.execute({
      accountName: s.me.accountName,
      intervalInSeconds: 5,
    })
    expect(errorScheduling).toBe(null)
    jest.advanceTimersByTime(1000 * 6)
    await new Promise(res => sac.client.on("loggedOn", res))
    expect(sac.logged).toBe(true)
  })
})
