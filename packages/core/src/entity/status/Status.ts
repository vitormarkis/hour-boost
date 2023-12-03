export abstract class Status {
	abstract name: StatusName
}

export type StatusName = "ACTIVE" | "BANNED"
