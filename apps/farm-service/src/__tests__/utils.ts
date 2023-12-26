import { HttpClient } from "core"

export function ensureExpectation(status: number, response: HttpClient.Response) {
  if (status !== response.status) console.log("INVALID!", response)
  expect(response.status).toBe(status)
}
