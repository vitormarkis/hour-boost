import { SteamAccount, SteamAccountCredentials, User } from "core"
import { SteamAccountsInMemory } from "~/infra/repository/SteamAccountsInMemory"
import { UsersInMemory } from "~/infra/repository/UsersInMemory"
import { UsersRepositoryInMemory } from "~/infra/repository/UsersRepositoryInMemory"
import { makeUser } from "~/utils/makeUser"

let usersMemory: UsersInMemory
usersMemory = new UsersInMemory()
const steamAccountsInMemory = new SteamAccountsInMemory()
// beforeEach(() => {
//   usersMemory = new UsersInMemory()
// })

const user = User.create({
  email: "",
  id_user: "user1",
  username: "versa",
  profilePic: "",
})

test("should create given user", async () => {
  expect(usersMemory.users).toHaveLength(0)
  const usersRepository = new UsersRepositoryInMemory(usersMemory, steamAccountsInMemory)
  await usersRepository.create(user)
  expect(usersMemory.users).toHaveLength(1)
  expect(await usersRepository.getByID("user1")).toBeInstanceOf(User)
  expect((await usersRepository.getByID("user1"))?.id_user).toBe("user1")
})

test("should update given user", async () => {
  expect(usersMemory.users).toHaveLength(1)
  const usersRepository = new UsersRepositoryInMemory(usersMemory, steamAccountsInMemory)
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
  expect(usersMemory.users).toHaveLength(1)
  const usersRepository = new UsersRepositoryInMemory(usersMemory, steamAccountsInMemory)
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
