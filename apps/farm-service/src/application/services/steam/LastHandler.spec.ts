import { LastHandler } from "~/application/services/steam/LastHandler"

test("should set last arguments and read", async () => {
  const lastHandler = new LastHandler()
  lastHandler.setLastArguments("loggedOn", [
    {
      name: "vitor",
    },
    {},
  ])
  expect(lastHandler.getLastArguments("loggedOn")).toStrictEqual([
    {
      name: "vitor",
    },
    {},
  ])
})

test("should run last handler if set", async () => {
  const lastHandler = new LastHandler()
  let nullish = null
  lastHandler.setLastHandler("loggedOn", () => {
    nullish = "string"
  })
  expect(nullish).toBeNull()
  lastHandler.getLastHandler("loggedOn")({}, {})
  expect(nullish).toBe("string")
})

test("should NOT throw if no last handler is set, log instead", async () => {
  const lastHandler = new LastHandler()
  expect(() => {
    lastHandler.getLastHandler("loggedOn")({}, {})
  }).not.toThrow()
})
