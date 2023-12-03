import { Usage } from "core/entity/plan/Usage"
import { UsageList } from "core/entity/plan/UsageList"

const makeUsage = (amountTime: number, id_usage: string = "123") =>
	Usage.restore({
		id_usage,
		amountTime,
		createdAt: new Date("2023-06-15T10:00:00"),
		plan_id: "plan_123",
		accountName: "acc1",
	})

test("should move usage to the trash", async () => {
	const usageList = new UsageList()
	const removedUsage = makeUsage(90, "234")
	usageList.add(makeUsage(90, "1"))
	usageList.add(removedUsage)
	usageList.add(makeUsage(90, "abc"))
	expect(usageList.data).toHaveLength(3)
	usageList.remove("234")
	expect(usageList.data).toHaveLength(2)
	expect(usageList.trash).toStrictEqual([removedUsage])
	expect(usageList.getIDs()).toStrictEqual(["1", "abc"])
	expect(usageList.getTrashIDs()).toStrictEqual(["234"])
})
