import { HttpClient } from "~/contracts"

export function ensureExpectation(status: number, response: HttpClient.Response) {
  if (status !== response.status) console.log("INVALID!", response)
  expect(response.status).toBe(status)
}
