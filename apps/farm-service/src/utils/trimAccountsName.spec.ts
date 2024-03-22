import { GuestPlan, IDGeneratorUUID, SteamAccount, SteamAccountCredentials } from "core"
import { trimAccountsName } from "./trimAccountsName"

test("should trim steam accounts", async () => {
  const idGenerator = new IDGeneratorUUID()
  const newPlan = GuestPlan.create({
    ownerId: "123",
  })
  const steamAccounts = [
    SteamAccount.create({
      credentials: SteamAccountCredentials.create({
        accountName: "foo",
        password: "xxx",
      }),
      idGenerator,
      ownerId: "123",
    }),
    SteamAccount.create({
      credentials: SteamAccountCredentials.create({
        accountName: "mrks",
        password: "xxx",
      }),
      idGenerator,
      ownerId: "123",
    }),
  ]
  const trimmingAccountsName = trimAccountsName({
    plan: newPlan,
    steamAccounts,
  })

  expect(trimmingAccountsName).toStrictEqual(["mrks"])
})
