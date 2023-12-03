import { PlanCreateProps, PlanProps } from "../Plan"
import { makeID } from "../../generateID"
import { PlanInfinity, PlanInfinityRestoreProps } from "../../../entity/plan/PlanInfinity"

export class GoldPlan extends PlanInfinity {
	private constructor(props: PlanProps) {
		super({
			...props,
			maxGamesAllowed: 32,
			maxSteamAccounts: 1,
			autoRestarter: true,
			name: "GOLD",
			price: 1800,
		})
	}

	static create(props: PlanCreateProps) {
		return new GoldPlan({
			ownerId: props.ownerId,
			id_plan: makeID(),
		})
	}

	static restore(props: PlanInfinityRestoreProps) {
		return new GoldPlan(props)
	}
}
