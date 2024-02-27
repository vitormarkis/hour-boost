import { DataOrFail, PlanCustomName, PlanInfinity, PlanUsage, User } from "core"
import { bad, nice } from "~/utils/helpers"
import { ChangeUserPlanUseCase } from "./ChangeUserPlanUseCase"

export class ChangeUserPlanToCustomUseCase implements IChangeUserPlanToCustomUseCase {
  constructor(private readonly changeUserPlanUseCase: ChangeUserPlanUseCase) {}

  async execute({ user }: ChangeUserPlanToCustomUseCasePayload) {
    const customPlanName = getCustomPlanNameViaOldPlan(user.plan)

    const [errorChangingUserPlan] = await this.changeUserPlanUseCase.execute({
      newPlanName: customPlanName,
      user,
    })

    if (errorChangingUserPlan) return bad(errorChangingUserPlan)

    return nice(user)
  }
}

export type ChangeUserPlanToCustomUseCasePayload = {
  user: User
}

interface IChangeUserPlanToCustomUseCase {
  execute(...args: any[]): Promise<DataOrFail<any>>
}

function getCustomPlanNameViaOldPlan(plan: PlanUsage | PlanInfinity): PlanCustomName {
  switch (plan.type) {
    case "INFINITY":
      return "INFINITY-CUSTOM"
    case "USAGE":
      return "USAGE-CUSTOM"
  }
}
