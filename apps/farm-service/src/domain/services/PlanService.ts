import {
  CustomInfinityPlan,
  CustomUsagePlan,
  type 
  DataOrFail,
  DiamondPlan,
  GoldPlan,
  GuestPlan,
  type 
  PlanAllNames,
  type 
  PlanInfinity,
  type 
  PlanInfinityName,
  type 
  PlanType,
  type 
  PlanUsage,
  type 
  PlanUsageName,
  SilverPlan,
} from "core"
import { bad, nice } from "~/utils/helpers"

export class PlanService implements IPlanService {
  createPlan({ newPlanName, currentPlan }: PlanServicePayload) {
    const [errorCreatingNewPlan, newPlan] = buildPlan({
      newPlanName,
      plan: currentPlan,
    })
    if (errorCreatingNewPlan) return bad(errorCreatingNewPlan)
    return nice(newPlan)
  }
}

export type PlanServicePayload = {
  currentPlan: PlanInfinity | PlanUsage
  newPlanName: PlanAllNames
}

interface IPlanService {
  createPlan(...args: any[]): DataOrFail<any>
}

type BuildUsagePlanProps = {
  plan: PlanUsage
  newPlanName: PlanUsageName
}

type BuildInfinityPlanProps = {
  plan: PlanInfinity
  newPlanName: PlanInfinityName
}

type BuildAllPlanProps = {
  plan: PlanUsage | PlanInfinity
  newPlanName: PlanAllNames
}

function buildPlan(buildPlanProps: BuildAllPlanProps) {
  const newPlanType = getPlanTypeByName(buildPlanProps.newPlanName)
  switch (newPlanType) {
    case "USAGE":
      const plan = buildUsagePlan({
        newPlanName: buildPlanProps.newPlanName as PlanUsageName,
        plan: buildPlanProps.plan as PlanUsage,
      })
      return nice(plan)
    case "INFINITY":
      return nice(
        buildInfinityPlan({
          newPlanName: buildPlanProps.newPlanName as PlanInfinityName,
          plan: buildPlanProps.plan as PlanInfinity,
        })
      )
  }
}

function buildUsagePlan({ newPlanName, plan }: BuildUsagePlanProps): PlanUsage {
  switch (newPlanName) {
    case "GUEST":
      return GuestPlan.create({ ownerId: plan.ownerId })
    case "USAGE-CUSTOM":
      return CustomUsagePlan.fromPlan(plan, plan.price)
  }
}

function buildInfinityPlan({ newPlanName, plan }: BuildInfinityPlanProps): PlanInfinity {
  switch (newPlanName) {
    case "DIAMOND":
      return DiamondPlan.create({ ownerId: plan.ownerId })
    case "GOLD":
      return GoldPlan.create({ ownerId: plan.ownerId })
    case "SILVER":
      return SilverPlan.create({ ownerId: plan.ownerId })
    case "INFINITY-CUSTOM":
      return CustomInfinityPlan.fromPlan(plan, plan.price)
  }
}

function getPlanTypeByName(planName: PlanAllNames): PlanType {
  switch (planName) {
    case "DIAMOND":
    case "GOLD":
    case "SILVER":
    case "INFINITY-CUSTOM":
      return "INFINITY"
    case "GUEST":
    case "USAGE-CUSTOM":
      return "USAGE"
  }
}
