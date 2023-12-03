import { UsageList } from "core/entity/plan/UsageList"
import { Usage } from "../../entity/plan"
import { PlanInfinity } from "../../entity/plan"
import { GuestPlan } from "../../entity/plan"
import { UsageUsedMoreThanPlanAllows } from "../exceptions"

let plan: GuestPlan

const makeUsage = (amountTime: number, id_usage: string = "123") =>
	Usage.restore({
		id_usage,
		amountTime,
		createdAt: new Date("2023-06-15T10:00:00"),
		plan_id: plan.id_plan,
		accountName: "acc1",
	})

beforeEach(() => {
	console.log = () => {}
	plan = GuestPlan.create({
		ownerId: "123",
	})
})

test("should decrease plan's usage", async () => {
	expect(plan.maxUsageTime).toBe(60 * 60 * 6)
	const usage = makeUsage(60 * 60 * 5)
	plan.use(usage)
	expect(plan.getUsageLeft()).toBe(3600)
})

test("should empty the plan's usage", async () => {
	expect(plan.maxUsageTime).toBe(60 * 60 * 6)
	plan.use(makeUsage(60 * 60 * 5))
	expect(plan.getUsageLeft()).toBe(3600)
	const result = plan.use(makeUsage(3601))
	expect(result).toBeInstanceOf(UsageUsedMoreThanPlanAllows)
})

test("should throw when attempts to use more than the plan allows", async () => {
	expect(plan.maxUsageTime).toBe(60 * 60 * 6)
	plan.use(makeUsage(60 * 60 * 5))
	expect(plan.getUsageLeft()).toBe(3600)
})

test("property isFarmAvailable should return false when user used all the plan's usage", async () => {
	expect(plan.name).toBe("GUEST")
})

test("should create a usage with the remaining usage left when attempts to use more than the plan allows", async () => {
	const result = plan.use(makeUsage(60 * 60 * 10))
	expect(result).toBeInstanceOf(UsageUsedMoreThanPlanAllows)
	expect(plan.getUsageLeft()).toBe(0)
	expect(plan.usages.data).toHaveLength(1)
	expect(plan.usages.data[0].amountTime).toBe(60 * 60 * 6)
})

test("should remove usage", async () => {
	const usage = makeUsage(99)
	plan.use(usage)
	expect(plan.usages.data).toHaveLength(1)
	plan.removeUsage(usage.id_usage)
	expect(plan.usages.data).toHaveLength(0)
})
