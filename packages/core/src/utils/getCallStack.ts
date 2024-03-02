export const getCallStack = () => {
  const value = new Error().stack
    ?.split("(")
    .map(path => {
      const [a, b, c] = path.split("/").reverse()
      return [c, b, a].join(" > ")
    })
    .map(s => {
      const [content, dirtyMethod] = s.split("\n")

      return [content.split(":").at(0), dirtyMethod].join(" -> ").replace(/\s+/g, " ").trim()
    })
  // .map(s => [s])
  // .map(s => [s])

  return value?.slice(1, value.length - 1)
}
