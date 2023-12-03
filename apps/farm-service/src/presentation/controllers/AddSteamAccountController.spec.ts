import { AddSteamAccount, DiamondPlan, IDGenerator, SteamAccountsRepository, User } from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts"
import { UsersDAOInMemory } from "~/infra/dao"
import { Publisher } from "~/infra/queue"
import { SteamAccountsRepositoryInMemory, UsersInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { SteamUserMock } from "~/infra/services"
import { AddSteamAccountController, promiseHandler } from "~/presentation/controllers"
import { makeUser } from "~/utils/makeUser"

const TIMEOUT = 300

const ME_ID = "123"
const ME_USERNAME = "vitormarkis"

const FRIEND_ID = "ABC"
const FRIEND_USERNAME = "matheus"

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
let steamAccountRepository: SteamAccountsRepository
let addSteamAccount: AddSteamAccount
let usersDAO: UsersDAOInMemory
const publisher = new Publisher()
const allUsersClientsStorage = new AllUsersClientsStorage(publisher, steamBuilder)
let sut: AddSteamAccountController
let me, friend: User
const idGenerator: IDGenerator = {
	makeID: () => "random",
}

const log = console.log
beforeEach(async () => {
	console.log = () => {}
	usersMemory = new UsersInMemory()
	usersRepository = new UsersRepositoryInMemory(usersMemory)
	steamAccountRepository = new SteamAccountsRepositoryInMemory(usersMemory)
	addSteamAccount = new AddSteamAccount(usersRepository, steamAccountRepository, idGenerator)
	me = makeUser(
		ME_ID,
		ME_USERNAME,
		DiamondPlan.create({
			ownerId: ME_ID,
		})
	)
	friend = makeUser(
		FRIEND_ID,
		FRIEND_USERNAME,
		DiamondPlan.create({
			ownerId: FRIEND_ID,
		})
	)
	usersDAO = new UsersDAOInMemory(usersMemory)
	;(sut = new AddSteamAccountController(
		addSteamAccount,
		allUsersClientsStorage,
		usersDAO,
		{
			create: () => new SteamUserMock(validSteamAccounts) as unknown as SteamUser,
		},
		publisher
	)),
		await usersRepository.create(me)
	await usersRepository.create(friend)
})

describe("CreateSteamAccountController test suite", () => {
	test("should add new account in case it exists on steam database", async () => {
		console.log = log
		const dbMe = await usersRepository.getByID(ME_ID)
		expect(dbMe?.steamAccounts.data).toHaveLength(0)
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
		expect(dbMe2?.steamAccounts.data).toHaveLength(1)
		expect(json).toStrictEqual({
			message: "user1 adicionada com sucesso!",
			steamAccountID: "random",
		})
		expect(status).toBe(201)
	})

	test("should reject if provided account don't exist on steam database", async () => {
		console.log = log
		const dbMe = await usersRepository.getByID(ME_ID)
		expect(dbMe!.steamAccounts.data).toHaveLength(0)
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
		expect(dbMe2!.steamAccounts.data).toHaveLength(0)
		expect(json).toStrictEqual(
			expect.objectContaining({
				message: "Steam Account não existe no banco de dados da Steam, delete essa conta e crie novamente.",
			})
		)
		expect(status).toBe(404)
	})

	test("should reject when user attempts to add an account he already has", async () => {
		await sut.handle({
			payload: { accountName: "user1", password: "xx", userId: ME_ID },
		})
		const dbMe = await usersRepository.getByID(ME_ID)
		expect(dbMe?.steamAccounts.data).toHaveLength(1)
		expect(dbMe?.plan.maxSteamAccounts).toBe(2)
		const { status, json } = await sut.handle({
			payload: {
				accountName: "user1",
				password: "xx",
				userId: ME_ID,
			},
		})
		const dbMe2 = await usersRepository.getByID(ME_ID)
		expect(dbMe2?.steamAccounts.data).toHaveLength(1)
		expect(json).toStrictEqual({
			message: "Você já possui essa conta cadastrada!",
		})
		expect(status).toBe(400)
	})

	test("should reject when user attempts to add an account that is already owned by other user", async () => {
		console.log = log
		await promiseHandler(
			sut.handle({
				payload: {
					accountName: "user1",
					password: "xx",
					userId: ME_ID,
				},
			})
		)
		const { status, json } = await promiseHandler(
			sut.handle({
				payload: {
					accountName: "user1",
					password: "xx",
					userId: FRIEND_ID,
				},
			})
		)

		expect(json).toStrictEqual({
			message: "Essa conta da Steam já foi registrada por outro usuário.",
		})
		expect(status).toBe(403)
	})

	test("should reject when user attempts to add more accounts than his plan allows", async () => {
		await sut.handle({
			payload: { accountName: "user1", password: "xx", userId: ME_ID },
		})
		await sut.handle({
			payload: { accountName: "user2", password: "xx", userId: ME_ID },
		})
		const dbMe = await usersRepository.getByID(ME_ID)
		expect(dbMe?.steamAccounts.data).toHaveLength(2)
		const { status, json } = await sut.handle({
			payload: {
				accountName: "user3",
				password: "xx",
				userId: ME_ID,
			},
		})
		const dbMe2 = await usersRepository.getByID(ME_ID)
		expect(dbMe2?.steamAccounts.data).toHaveLength(2)
		expect(json).toStrictEqual({
			message: "Você já adicionou o máximo de contas que seu plano permite!",
		})
		expect(status).toBe(400)
	})

	test("should asks user for the steam guard", async () => {
		sut = new AddSteamAccountController(
			addSteamAccount,
			allUsersClientsStorage,
			usersDAO,
			{
				create: () => new SteamUserMock(validSteamAccounts, true) as unknown as SteamUser,
			},
			publisher
		)
		const { status, json } = await promiseHandler(
			sut.handle({
				payload: { accountName: "user1", password: "xx", userId: ME_ID },
			})
		)

		expect(json).toStrictEqual({
			message: "Steam Guard requerido. Enviando para seu celular.",
		})
		expect(status).toBe(202)
	})

	test.skip("should ask for steam guard if asked", async () => {
		throw new Error("Not implemented")
	})

	test.skip("should timeout", async () => {
		throw new Error("Not implemented")
	})
})
