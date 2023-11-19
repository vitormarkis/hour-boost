import { AddSteamAccount, DiamondPlan, User } from "core"
import SteamUser from "steam-user"
import { SteamFarming } from "~/application/services"
import { SteamBuilder } from "~/contracts/SteamBuilder"
import { UsersDAOInMemory } from "~/infra/dao"
import { Publisher } from "~/infra/queue"
import { UsersInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { SteamUserMock } from "~/infra/services/SteamUserMock"
import { AddSteamAccountController } from "~/presentation/controllers"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"

const ME_ID = "123"
const ME_USERNAME = "vitormarkis"

const validSteamAccounts = [
  { accountName: "user1", password: "xx" },
  { accountName: "user2", password: "xx" },
  { accountName: "user3", password: "xx" },
]

const steamBuilder: SteamBuilder = {
  create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
}

let usersMemory: UsersInMemory
let usersRepository: UsersRepositoryInMemory
let addSteamAccount: AddSteamAccount
let usersDAO: UsersDAOInMemory
const publisher = new Publisher()
const steamFarming = new SteamFarming(publisher, steamBuilder)
let sut: AddSteamAccountController
let me: User

beforeEach(async () => {
  usersMemory = new UsersInMemory()
  usersRepository = new UsersRepositoryInMemory(usersMemory)
  addSteamAccount = new AddSteamAccount(usersRepository, {
    makeID: () => "random",
  })
  me = makeUser(
    ME_ID,
    ME_USERNAME,
    DiamondPlan.create({
      ownerId: ME_ID,
    })
  )
  usersDAO = new UsersDAOInMemory(usersMemory)
  sut = new AddSteamAccountController(addSteamAccount, steamFarming, usersDAO)
  await usersRepository.create(me)
})

describe("CreateSteamAccountController test suite", () => {
  test("should add new account in case it exists on steam database", async () => {
    const dbMe = await usersRepository.getByID(ME_ID)
    expect(dbMe?.steamAccounts).toHaveLength(0)
    const { status, json } = await promiseHandler(
      sut.handle({
        payload: {
          accountName: "user1",
          password: "xx",
          userId: ME_ID,
        },
      })
    )
    const dbMe2 = await usersRepository.getByID(ME_ID)
    expect(dbMe2?.steamAccounts).toHaveLength(1)
    expect(json).toStrictEqual({ message: "user1 adicionada com sucesso!", steamAccountID: "random" })
    expect(status).toBe(201)
  })

  test("should reject if provided account don't exist on steam database", async () => {
    const dbMe = await usersRepository.getByID(ME_ID)
    expect(dbMe!.steamAccounts).toHaveLength(0)
    const { status, json } = await promiseHandler(
      sut.handle({
        payload: {
          accountName: "random_user",
          password: "xx",
          userId: ME_ID,
        },
      })
    )
    const dbMe2 = await usersRepository.getByID(ME_ID)
    expect(dbMe2!.steamAccounts).toHaveLength(0)
    expect(json).toStrictEqual(expect.objectContaining({ message: "CLX: Error of type Account not found." }))
    expect(status).toBe(400)
  })

  test("should reject when user attempts to add an account he already has", async () => {
    await sut.handle({ payload: { accountName: "user1", password: "xx", userId: ME_ID } })
    const dbMe = await usersRepository.getByID(ME_ID)
    expect(dbMe?.steamAccounts).toHaveLength(1)
    expect(dbMe?.plan.maxSteamAccounts).toBe(2)
    const { status, json } = await sut.handle({
      payload: {
        accountName: "user1",
        password: "xx",
        userId: ME_ID,
      },
    })
    const dbMe2 = await usersRepository.getByID(ME_ID)
    expect(dbMe2?.steamAccounts).toHaveLength(1)
    expect(json).toStrictEqual({ message: "Você já possui essa conta cadastrada!" })
    expect(status).toBe(400)
  })

  test("should reject when user attempts to add more accounts than his plan allows", async () => {
    await sut.handle({ payload: { accountName: "user1", password: "xx", userId: ME_ID } })
    await sut.handle({ payload: { accountName: "user2", password: "xx", userId: ME_ID } })
    const dbMe = await usersRepository.getByID(ME_ID)
    expect(dbMe?.steamAccounts).toHaveLength(2)
    const { status, json } = await sut.handle({
      payload: {
        accountName: "user3",
        password: "xx",
        userId: ME_ID,
      },
    })
    const dbMe2 = await usersRepository.getByID(ME_ID)
    expect(dbMe2?.steamAccounts).toHaveLength(2)
    expect(json).toStrictEqual({ message: "Você já adicionou o máximo de contas que seu plano permite!" })
    expect(status).toBe(400)
  })
})
