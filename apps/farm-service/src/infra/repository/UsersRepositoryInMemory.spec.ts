import { SteamAccount, SteamAccountCredentials, User } from "core"
import { password } from "~/__tests__/instances"
import { SteamAccountsInMemory } from "~/infra/repository/SteamAccountsInMemory"
import { UsersInMemory } from "~/infra/repository/UsersInMemory"
import { UsersRepositoryInMemory } from "~/infra/repository/UsersRepositoryInMemory"
import { makeUser } from "~/utils/makeUser"

let usersMemory = new UsersInMemory()
let steamAccountsInMemory = new SteamAccountsInMemory()
let usersRepository: UsersRepositoryInMemory
// beforeEach(() => {
//   usersMemory = new UsersInMemory()
// })

let user: User

beforeEach(() => {
  steamAccountsInMemory = new SteamAccountsInMemory()
  usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory, steamAccountsInMemory)
  user = User.create({
    email: "",
    id_user: "user1",
    username: "versa",
    profilePic: "",
  })
})

test("should create given user", async () => {
  expect(usersMemory.users).toHaveLength(0)
  expect(steamAccountsInMemory.steamAccounts).toHaveLength(0)
  await usersRepository.create(user)
  expect(usersMemory.users).toHaveLength(1)
  expect(await usersRepository.getByID("user1")).toBeInstanceOf(User)
  expect((await usersRepository.getByID("user1"))?.id_user).toBe("user1")
})

test("should update given user", async () => {
  await usersRepository.create(user)
  expect(usersMemory.users).toHaveLength(1)
  const user2 = makeUser("user1", "versa")
  user2.addSteamAccount(
    SteamAccount.create({
      credentials: SteamAccountCredentials.create({
        accountName: "sa_123",
        password: "pass_123",
      }),
      idGenerator: {
        makeID: () => "998",
      },
      ownerId: user2.id_user,
    })
  )
  expect(usersMemory.users).toHaveLength(1)
  expect((await usersRepository.getByID("user1"))?.steamAccounts.data).toHaveLength(0)

  await usersRepository.update(user2)
  expect(usersMemory.users).toHaveLength(1)
})

test("should throw when try to update non existing user", async () => {
  await usersRepository.create(user)
  expect(usersMemory.users).toHaveLength(1)
  const user2 = makeUser("RANDOM_ID_NEVER_SEEN_BEFORE", "versa")
  user2.addSteamAccount(
    SteamAccount.create({
      credentials: SteamAccountCredentials.create({
        accountName: "sa_123",
        password: "pass_123",
      }),
      idGenerator: {
        makeID: () => "998",
      },
      ownerId: user2.id_user,
    })
  )

  await expect(usersRepository.update(user2)).rejects.toThrow("Usuário não encontrado.")
  expect(usersMemory.users).toHaveLength(1)
})

test("should add steam account", async () => {
  expect(usersMemory.users).toHaveLength(0)
  expect(steamAccountsInMemory.steamAccounts).toHaveLength(0)
  await usersRepository.create(user)
  expect(usersMemory.users).toHaveLength(1)
  expect(steamAccountsInMemory.steamAccounts).toHaveLength(0)
  const steamAccount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: "paco",
      password,
    }),
    idGenerator: { makeID: () => "1234" },
    ownerId: user.id_user,
  })
  const [error] = user.addSteamAccount(steamAccount)
  expect(error).toBeNull()
  await usersRepository.update(user)
  expect(usersMemory.users).toHaveLength(1)
  expect(steamAccountsInMemory.steamAccounts).toHaveLength(1)
  expect(steamAccountsInMemory.accountNamesInDB).toStrictEqual(["paco"])

  expect(user.steamAccounts.data).toHaveLength(1)
  expect(user.steamAccounts.getTrashIDs()).toHaveLength(0)
})

test("should add and remove steam account", async () => {
  expect(usersMemory.users).toHaveLength(0)
  expect(steamAccountsInMemory.steamAccounts).toHaveLength(0)
  await usersRepository.create(user)
  const steamAccount = SteamAccount.create({
    credentials: SteamAccountCredentials.create({
      accountName: "paco",
      password,
    }),
    idGenerator: { makeID: () => "1234" },
    ownerId: user.id_user,
  })
  const [error] = user.addSteamAccount(steamAccount)
  expect(error).toBeNull()
  await usersRepository.update(user)
  user.steamAccounts.data.findIndex(sa => sa.credentials.accountName === "paco")
  expect(user.steamAccounts.getTrashIDs()).toHaveLength(0)
  user.steamAccounts.remove("1234")
  expect(user.steamAccounts.getTrashIDs()).toHaveLength(1)
  await usersRepository.update(user)
  const user2 = await usersRepository.getByID(user.id_user)
  if (!user2) throw "user not found"
  expect(steamAccountsInMemory.accountNamesInDB).toStrictEqual(["paco"])
  expect(user2.steamAccounts.getIDs()).toHaveLength(0)
  expect(user2.steamAccounts.getTrashIDs()).toHaveLength(0)
  const savedAccount = steamAccountsInMemory.steamAccounts[0]
  expect(savedAccount.credentials.accountName).toBe("paco")
  expect(savedAccount.ownerId).toBeNull()
})
