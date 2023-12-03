import { areTwoArraysEqual } from "~/utils/areTwoArraysEqual"

describe("areTwoArraysEqual test suite", () => {
	test("should return false when arrays are diferent", async () => {
		const arr1 = [1, 2, 3, 4]
		expect(areTwoArraysEqual(arr1, [5, 6, 7, 8])).toBe(false)
		expect(areTwoArraysEqual(arr1, [1, 2, 3, 5])).toBe(false)
		expect(areTwoArraysEqual(arr1, [4, 3, 2, 5])).toBe(false)
		expect(areTwoArraysEqual(arr1, [3, 2, 4, 1])).toBe(true)
		expect(areTwoArraysEqual([], [])).toBe(true)
		expect(areTwoArraysEqual([1], [])).toBe(false)
		expect(areTwoArraysEqual(arr1, [1, 2, 3, 4, 4, 4, 4])).toBe(false)
	})
})
