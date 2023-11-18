export function areTwoArraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) {
    return false
  }
  let set1 = new Set(a)
  let set2 = new Set(b)
  if (set1.size != set2.size) {
    return false
  }
  return Array.from(set1).every(function (element) {
    return set2.has(element)
  })
}
