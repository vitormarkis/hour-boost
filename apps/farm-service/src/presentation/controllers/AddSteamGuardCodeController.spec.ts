import { AddSteamAccount, IDGenerator, SteamAccountsRepository, User, UsersDAO, UsersRepository } from "core"
import SteamUser from "steam-user"
import { AllUsersClientsStorage } from "~/application/services"
import { SteamBuilder } from "~/contracts"
import { UsersDAOInMemory } from "~/infra/dao"
import { Publisher } from "~/infra/queue"
import { SteamAccountsRepositoryInMemory, UsersInMemory, UsersRepositoryInMemory } from "~/infra/repository"
import { SteamUserMock } from "~/infra/services"
import { AddSteamAccountController } from "~/presentation/controllers/AddSteamAccountController"
import { AddSteamGuardCodeController } from "~/presentation/controllers/AddSteamGuardCodeController"
import { promiseHandler } from "~/presentation/controllers/promiseHandler"
import { makeUser } from "~/utils/makeUser"

const USER_ACCOUNT_NAME = "user1"
const USER_USERNAME = "vitor"
const USER_ID = "123"

const validSteamAccounts = [
	{ accountName: "user1", password: "user1_PASS" },
	{ accountName: "user2", password: "xx" },
	{ accountName: "user3", password: "xx" },
]

let allUsersClientsStorage: AllUsersClientsStorage
let publisher: Publisher
let steamBuilder: SteamBuilder
let addSteamGuardCodeController: AddSteamGuardCodeController
let addSteamAccountController: AddSteamAccountController
let addSteamAccount: AddSteamAccount
let usersMemory: UsersInMemory
let usersRepository: UsersRepository
let steamAccountsRepository: SteamAccountsRepository
let idGenerator: IDGenerator
let usersDAO: UsersDAO
let user: User

const log = console.log

beforeEach(async () => {
	publisher = new Publisher()
	usersMemory = new UsersInMemory()
	usersRepository = new UsersRepositoryInMemory(usersMemory)
	usersDAO = new UsersDAOInMemory(usersMemory)
	steamBuilder = {
		create: () => new SteamUserMock(validSteamAccounts, true) as unknown as SteamUser,
	}
	allUsersClientsStorage = new AllUsersClientsStorage(publisher, steamBuilder)
	addSteamGuardCodeController = new AddSteamGuardCodeController(allUsersClientsStorage)
	steamAccountsRepository = new SteamAccountsRepositoryInMemory(usersMemory)
	idGenerator = { makeID: () => "998" }
	addSteamAccount = new AddSteamAccount(usersRepository, steamAccountsRepository, idGenerator)
	user = makeUser(USER_ID, USER_USERNAME)
	await usersRepository.create(user)
	addSteamAccountController = new AddSteamAccountController(
		addSteamAccount,
		allUsersClientsStorage,
		usersDAO,
		steamBuilder,
		publisher
	)
	console.log = () => {}
})

describe("AddSteamGuardCodeController test suite", () => {
	test("should reject when providing code for a sac that never tried to log", async () => {
		const { status, json } = await promiseHandler(
			addSteamGuardCodeController.handle({
				payload: {
					accountName: USER_ACCOUNT_NAME,
					code: "998776",
					userId: USER_ID,
				},
			})
		)

		expect(json).toStrictEqual({
			message: "Falha ao adicionar código Steam Guard. Usuário nunca tentou fazer login com essa conta.",
		})
		expect(status).toBe(400)
	})

	describe("user has attempted to log", () => {
		beforeEach(async () => {
			await userAddSteamAccount(addSteamAccountController)
		})

		test("should set the steam guard code and log in", async () => {
			console.log = log
			const { status, json } = await promiseHandler(
				addSteamGuardCodeController.handle({
					payload: {
						accountName: USER_ACCOUNT_NAME,
						code: "998776",
						userId: USER_ID,
					},
				})
			)
			console.log({
				json,
			})
			expect(status).toBe(200)
		})

		test.skip("should rejects an error is thrown", async () => {
			throw new Error("Not implemented")
		})
	})
})

function userAddSteamAccount(controller: AddSteamAccountController) {
	return promiseHandler(
		controller.handle({
			payload: {
				accountName: USER_ACCOUNT_NAME,
				password: "user1_PASS",
				userId: USER_ID,
			},
		})
	)
}
