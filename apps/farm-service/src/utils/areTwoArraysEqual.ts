export function areTwoArraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) {
    return false
  }
  const set1 = new Set(a)
  const set2 = new Set(b)
  if (set1.size != set2.size) {
    return false
  }
  return Array.from(set1).every(element => set2.has(element))
}
