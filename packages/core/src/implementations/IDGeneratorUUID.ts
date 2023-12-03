import { IDGenerator } from "core/contracts"
import { randomUUID } from "crypto"

export class IDGeneratorUUID implements IDGenerator {
	makeID(): string {
		return randomUUID()
	}
}
