import { AddSteamAccount } from "core"
import { makeTestInstances, password, validSteamAccounts } from "~/__tests__/instances"
import {
  AddSteamAccountUseCase,
  CreateUserUseCase,
  ScheduleAutoReloginUseCase,
} from "~/application/use-cases"
import { RestoreAccountSessionUseCase } from "~/application/use-cases"
import { AutoReloginScheduler } from "~/domain/cron"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

const i = makeTestInstances(
  {
    validSteamAccounts,
  }
  // {
  //   steamUserBuilder: new SteamUserMockBuilder(validSteamAccounts, true),
  // }
)

const autoReloginScheduler = new AutoReloginScheduler()
const createUser = new CreateUserUseCase(i.usersRepository, i.userAuthentication, i.usersClusterStorage)

const addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)
const addSteamAccountUseCase = new AddSteamAccountUseCase(
  addSteamAccount,
  i.allUsersClientsStorage,
  i.usersDAO,
  i.checkSteamAccountOwnerStatusUseCase
)

const restoreAccountSessionUseCase = new RestoreAccountSessionUseCase(
  i.steamAccountsRepository,
  i.allUsersClientsStorage,
  i.usersDAO,
  i.usersClusterStorage,
  i.sacStateCacheRepository
)

async function main() {
  await createUser.execute(s.me.userId)
  const [errorAddSteamAccountUseCase] = await addSteamAccountUseCase.execute({
    accountName: s.me.accountName,
    password,
    authCode: "12345",
    userId: s.me.userId,
  })

  if (errorAddSteamAccountUseCase) {
    console.log({ msg: errorAddSteamAccountUseCase.message, code: errorAddSteamAccountUseCase.code })
    return
  }
  // connection.emit("break")

  const sac = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
  console.log("first sac status: ", sac.logged)
  console.log({ cronKeys: autoReloginScheduler.listCronsKeys() })
  const scheduleAutoRelogin = new ScheduleAutoReloginUseCase(
    autoReloginScheduler,
    restoreAccountSessionUseCase
  )
  const [errorScheduling] = await scheduleAutoRelogin.execute({
    accountName: s.me.accountName,
    intervalInSeconds: 3,
  })
  if (errorScheduling) {
    console.log({ msg: errorScheduling.message, code: errorScheduling.code })
    return
  }
  const sac2 = i.allUsersClientsStorage.getAccountClientOrThrow(s.me.userId, s.me.accountName)
  console.log("second sac status: ", sac2.logged)
}

main()
