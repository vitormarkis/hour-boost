import { getAsyncFunction } from "~/application/services/event-emitter"

test("should separate async function from regular function", async () => {
  function reg() {}
  async function asy() {}
  const { asyncHandlers, handlers } = getAsyncFunction([reg, asy])
  expect(asyncHandlers).toHaveLength(1)
  expect(handlers).toHaveLength(1)
})

test("should separate async function from regular function", async () => {
  let tx = 0
  const asy = async () => new Promise(res => setTimeout(res, 200))
  const asy2 = async () => new Promise(res => setTimeout(res, 250))
  const { asyncHandlers } = getAsyncFunction([asy, asy2])
  expect(asyncHandlers).toHaveLength(2)
  const promises = asyncHandlers.map(asyncHandler => asyncHandler())
  await Promise.all(promises).finally(() => {
    tx = 1
  })
  expect(tx).toBe(1)
})
