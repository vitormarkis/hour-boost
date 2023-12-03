import { makeID } from "./generateID"

export class Purchase implements PurchaseProps {
	readonly id_Purchase: string

	private constructor(props: PurchaseProps) {
		this.id_Purchase = props.id_Purchase
	}

	static create(props: PurchaseCreateProps) {
		return new Purchase({
			...props,
			id_Purchase: makeID(),
		})
	}

	static restore(props: PurchaseProps) {
		return new Purchase(props)
	}
}

export interface PurchaseProps {
	id_Purchase: string
}

export interface PurchaseCreateProps {}
