import { AddSteamAccount } from "core"
import {
  CustomInstances,
  MakeTestInstancesProps,
  PrefixKeys,
  makeTestInstances,
  password,
  validSteamAccounts,
} from "~/__tests__/instances"
import { RemoveSteamAccountUseCase } from "~/application/use-cases"
import { CheckSteamAccountOwnerStatusUseCase } from "~/application/use-cases/"
import { AddSteamAccountUseCase } from "~/application/use-cases/AddSteamAccountUseCase"
import { testUsers as s } from "~/infra/services/UserAuthenticationInMemory"

const log = console.log
console.log = () => {}

let i = makeTestInstances({
  validSteamAccounts,
})
let meInstances = {} as PrefixKeys<"me">
let removeSteamAccountUseCase: RemoveSteamAccountUseCase
let addSteamAccount: AddSteamAccount
let addSteamAccountUseCase: AddSteamAccountUseCase
let checkSteamAccountOwnerStatusUseCase: CheckSteamAccountOwnerStatusUseCase

async function setupInstances(props?: MakeTestInstancesProps, customInstances?: CustomInstances) {
  i = makeTestInstances(props, customInstances)
  meInstances = await i.createUser("me", { persistSteamAccounts: false })
  const accountId = meInstances.me.steamAccounts.data[0].id_steamAccount
  meInstances.me.steamAccounts.remove(accountId)
  checkSteamAccountOwnerStatusUseCase = new CheckSteamAccountOwnerStatusUseCase(i.steamAccountsRepository)
  addSteamAccount = new AddSteamAccount(i.usersRepository, i.steamAccountsRepository, i.idGenerator)
  addSteamAccountUseCase = new AddSteamAccountUseCase(
    addSteamAccount,
    i.allUsersClientsStorage,
    i.usersDAO,
    checkSteamAccountOwnerStatusUseCase
  )
  removeSteamAccountUseCase = new RemoveSteamAccountUseCase(
    i.usersRepository,
    i.allUsersClientsStorage,
    i.sacStateCacheRepository,
    i.usersClusterStorage,
    i.planRepository
  )
  i.steamAccountsMemory.disownSteamAccountsAll()
  i.usersMemory.dropAllSteamAccounts()
}

beforeEach(async () => {
  await setupInstances({
    validSteamAccounts,
  })
})

test("should remove steam account", async () => {
  await addSteamAccount.execute({
    accountName: s.me.accountName,
    userId: s.me.userId,
    password,
  })
  const accountId = meInstances.me.steamAccounts.data[0].id_steamAccount
  const account1 = await i.steamAccountsRepository.getByAccountName(s.me.accountName)
  expect(account1?.ownerId).toBe(s.me.userId)

  const [error] = await removeSteamAccountUseCase.execute({
    accountName: s.me.accountName,
    steamAccountId: accountId,
    userId: s.me.userId,
    username: s.me.username,
  })
  if (error) throw error
  const account2 = await i.steamAccountsRepository.getByAccountName(s.me.accountName)
  expect(account2?.credentials.accountName).toBe("paco")
  expect(account2?.ownerId).toBe(null)
})
