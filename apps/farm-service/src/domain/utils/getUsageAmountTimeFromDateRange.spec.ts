import { getUsageAmountTimeFromDateRange } from "~/domain/utils/getUsageAmountTimeFromDateRange"

test("should get 1 minute amount time", async () => {
  const past = new Date("2023-06-10T10:00:00.000Z")
  const now = new Date("2023-06-10T10:01:00.000Z")
  const amountTime = getUsageAmountTimeFromDateRange(past, now)
  expect(amountTime).toBe(60)
})

test("should get 1 minute, 10 seconds amount time", async () => {
  const past = new Date("2023-06-10T10:00:00.000Z")
  const now = new Date("2023-06-10T10:01:10.000Z")
  const amountTime = getUsageAmountTimeFromDateRange(past, now)
  expect(amountTime).toBe(70)
})

test("should get 13 minutes, 23 seconds amount time", async () => {
  const past = new Date("2023-06-10T10:00:00.000Z")
  const now = new Date("2023-06-10T10:13:23.000Z")
  const amountTime = getUsageAmountTimeFromDateRange(past, now)
  expect(amountTime).toBe(803)
})
