export function getUserInitials(username: string | undefined) {
  if (!username) return "HB"
  const a = username.at(0)
  const b = username.at(-1)
  if (!a || !b) return "HB"
  return a + b
}
