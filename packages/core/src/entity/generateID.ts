import { randomUUID } from "crypto"

export function makeID() {
  return randomUUID()
}
