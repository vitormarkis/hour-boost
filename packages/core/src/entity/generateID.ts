import crypto from "node:crypto"

export function makeID() {
	return crypto.randomUUID()
}
