import { SteamUserMockBuilder } from "~/utils/builders/SteamMockBuilder"

test("should create mobile mock steam user", async () => {
  const steamBuilder = new SteamUserMockBuilder([], true)
  const sac = steamBuilder.create()
  // @ts-ignore
  expect(sac.isMobile()).toBe(true)
})