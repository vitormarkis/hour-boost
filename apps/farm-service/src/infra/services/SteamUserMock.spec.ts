import { SteamUserMock } from "~/infra/services/SteamUserMock"
import { sleep } from "~/utils"

const mockHandler = () => () => {}

const validSteamAccounts = [
	{
		accountName: "vitor",
		password: "123",
	},
]

describe("SteamUserMock test suite", () => {
	test("should call `loggedOn` when valid credentials are passed", async () => {
		const sut = new SteamUserMock(validSteamAccounts)
		const emitSpy = jest.spyOn(sut, "emit")
		sut.on("loggedOn", mockHandler())
		sut.on("error", mockHandler())
		sut.logOn({
			accountName: "vitor",
			password: "123",
		})
		await sleep(0.01)
		expect(emitSpy).toHaveBeenCalledTimes(1)
		expect(emitSpy).toBeCalledWith("loggedOn")
		expect(emitSpy).not.toBeCalledWith("error", { eresult: 18 })
	})

	test("should NOT call `loggedOn` when invalid credentials are passed", async () => {
		const sut = new SteamUserMock(validSteamAccounts)
		const emitSpy = jest.spyOn(sut, "emit")
		sut.on("loggedOn", mockHandler())
		sut.on("error", mockHandler())
		sut.logOn({
			accountName: "random",
			password: "998",
		})
		await sleep(0.01)
		expect(emitSpy).toHaveBeenCalledTimes(1)
		expect(emitSpy).not.toBeCalledWith("loggedOn")
		expect(emitSpy).toBeCalledWith("error", { eresult: 18 })
	})
})
