import { makeSteamAccount } from "~/__tests__/instances"
import { SteamAccountsInMemory } from "~/infra/repository/SteamAccountsInMemory"

test("should add new account", async () => {
  const accountsInMemory = new SteamAccountsInMemory()
  const steamAccount = makeSteamAccount("owner_id", "paco")
  accountsInMemory.addOrUpdate(steamAccount)
  const account = accountsInMemory.getByAccountName("paco")
  expect(account).toBeTruthy()
})

test("should toggle auto relogin and update it", async () => {
  const accountsInMemory = new SteamAccountsInMemory()
  const steamAccount = makeSteamAccount("owner_id", "paco")
  accountsInMemory.addOrUpdate(steamAccount)
  const account = accountsInMemory.getByAccountName("paco")
  expect(account.autoRelogin).toBe(false)
  account.toggleAutoRelogin()
  accountsInMemory.addOrUpdate(account)
  const account2 = accountsInMemory.getByAccountName("paco")
  expect(account2.autoRelogin).toBe(true)
})

test("should add if don't exists on db", async () => {
  const accountsInMemory = new SteamAccountsInMemory()
  expect(accountsInMemory.ids).toHaveLength(0)
  const steamAccount = makeSteamAccount("owner_id", "paco")
  const steamAccount2 = makeSteamAccount("owner_id", "deno")
  const steamAccount3 = makeSteamAccount("owner_id_123", "cherry")
  accountsInMemory.addIfDontExists([steamAccount, steamAccount2, steamAccount3])
  expect(accountsInMemory.ids).toHaveLength(3)
})

test("should not add if already exists on db", async () => {
  const accountsInMemory = new SteamAccountsInMemory()
  expect(accountsInMemory.ids).toHaveLength(0)
  const steamAccount = makeSteamAccount("owner_id", "paco")
  const steamAccount2 = makeSteamAccount("owner_id", "deno")
  const steamAccount3 = makeSteamAccount("owner_id_123", "cherry")
  accountsInMemory.addIfDontExists([steamAccount, steamAccount2, steamAccount3])
  expect(accountsInMemory.ids).toHaveLength(3)
  accountsInMemory.addIfDontExists([steamAccount, steamAccount2, steamAccount3])
  expect(accountsInMemory.ids).toHaveLength(3)
})
